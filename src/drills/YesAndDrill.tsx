import { useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react'
import type { YesAndItem } from '../data/schema'
import type { DrillProps } from './types'
import { Feedback } from './Feedback'
import { Button } from '../components/Button'
import { CheckIcon, XIcon } from '../components/icons'
import { shuffle } from '../lib/random'
import { gradeYesAnd, xpFor } from '../lib/scoring'
import { useHotkeys } from '../lib/useHotkeys'

const SWIPE_PX = 90
const FLASH_MS = 650

type Call = { keepsGoing: boolean; correct: boolean }

export function YesAndDrill({ item, onResult, onNext }: DrillProps<YesAndItem>) {
  const [cards] = useState(() => shuffle(item.cards))
  const [index, setIndex] = useState(0)
  const [calls, setCalls] = useState<Call[]>([])
  const [flash, setFlash] = useState<Call | null>(null)
  const [xp, setXp] = useState(0)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-12, 12])
  const yesOpacity = useTransform(x, [20, SWIPE_PX], [0, 1])
  const noOpacity = useTransform(x, [-SWIPE_PX, -20], [1, 0])

  const done = calls.length === cards.length
  const card = cards[index]

  function decide(keepsGoing: boolean) {
    if (flash || done) return
    const call = { keepsGoing, correct: keepsGoing === card.keepsGoing }
    setFlash(call)
    const finish = () => {
      const next = [...calls, call]
      setCalls(next)
      setFlash(null)
      x.set(0)
      if (next.length === cards.length) {
        const result = gradeYesAnd(next.filter((c) => c.correct).length, cards.length)
        const gained = xpFor(result)
        setXp(gained)
        onResult(result, gained)
      } else {
        setIndex((i) => i + 1)
      }
    }
    if (reduce) {
      setTimeout(finish, FLASH_MS)
    } else {
      animate(x, keepsGoing ? 480 : -480, { duration: 0.3, ease: 'easeIn' })
      setTimeout(finish, FLASH_MS)
    }
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_PX) decide(true)
    else if (info.offset.x < -SWIPE_PX) decide(false)
    else animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
  }

  useHotkeys({ ArrowRight: () => decide(true), ArrowLeft: () => decide(false) }, !done)

  if (done) {
    const correct = calls.filter((c) => c.correct).length
    return (
      <div className="flex flex-col gap-5">
        <Prompt item={item} />
        <Feedback
          result={gradeYesAnd(correct, cards.length)}
          xp={xp}
          pattern={item.pattern}
          why={`You sorted ${correct} of ${cards.length} correctly.`}
          onNext={onNext}
        >
          <ul className="flex flex-col gap-3">
            {cards.map((c, i) => (
              <li
                key={c.text}
                className={`rounded-2xl border-2 p-4 ${calls[i].correct ? 'border-good/50 bg-surface' : 'border-bad bg-bad-soft'}`}
              >
                <p className="text-[15px]">“{c.text}”</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide">
                  <span className={c.keepsGoing ? 'text-good' : 'text-bad'}>
                    {c.keepsGoing ? 'Yes, And' : 'Killer'}
                  </span>
                  {!calls[i].correct && <span className="text-muted"> · you swiped {calls[i].keepsGoing ? 'right' : 'left'}</span>}
                </p>
                <p className="mt-1 text-sm text-muted">{c.why}</p>
              </li>
            ))}
          </ul>
        </Feedback>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Prompt item={item} />

      <p className="text-center text-sm text-muted">
        Card {index + 1} of {cards.length} · swipe right if it keeps the volley going
      </p>

      <div className="relative h-60 select-none">
        <motion.div
          key={card.text}
          drag={flash ? false : 'x'}
          dragSnapToOrigin={false}
          onDragEnd={onDragEnd}
          style={{ x, rotate: reduce ? 0 : rotate }}
          initial={reduce ? false : { scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`absolute inset-0 flex cursor-grab touch-pan-y items-center justify-center rounded-3xl border-2 bg-surface p-6 text-center shadow-lg active:cursor-grabbing ${
            flash ? (flash.correct ? 'border-good' : 'border-bad') : 'border-line'
          }`}
          role="group"
          aria-label="Response card"
        >
          <p className="font-display text-xl leading-snug">“{card.text}”</p>
          <motion.span
            style={{ opacity: yesOpacity }}
            className="absolute left-4 top-4 -rotate-12 rounded-lg border-2 border-good px-2 py-0.5 text-sm font-black uppercase text-good"
          >
            Yes, And
          </motion.span>
          <motion.span
            style={{ opacity: noOpacity }}
            className="absolute right-4 top-4 rotate-12 rounded-lg border-2 border-bad px-2 py-0.5 text-sm font-black uppercase text-bad"
          >
            Killer
          </motion.span>
        </motion.div>
        {flash && (
          <div
            aria-live="assertive"
            className={`pointer-events-none absolute inset-x-0 -bottom-3 mx-auto w-fit rounded-full px-4 py-1.5 text-sm font-bold shadow ${
              flash.correct ? 'bg-good text-surface' : 'bg-bad text-surface'
            }`}
          >
            {flash.correct ? 'Right call' : card.keepsGoing ? 'That one kept it going' : 'That one killed it'}
          </div>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => decide(false)} disabled={!!flash} aria-label="Swipe left: conversation killer" className="text-bad!">
          <XIcon /> Killer
        </Button>
        <Button variant="secondary" onClick={() => decide(true)} disabled={!!flash} aria-label="Swipe right: yes, and" className="text-good!">
          Yes, And <CheckIcon />
        </Button>
      </div>
      <p className="hidden text-center text-xs text-muted sm:block">Keyboard: ← killer · → yes, and</p>
    </div>
  )
}

function Prompt({ item }: { item: YesAndItem }) {
  return (
    <div className="rounded-3xl bg-lake p-5 text-on-lake">
      <p className="text-xs font-bold uppercase tracking-widest opacity-75">{item.context ?? 'They say'}</p>
      <p className="mt-2 font-display text-xl leading-snug">“{item.prompt}”</p>
    </div>
  )
}
