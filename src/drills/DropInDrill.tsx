import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { DropInItem } from '../data/schema'
import type { DrillProps } from './types'
import { Feedback } from './Feedback'
import { Button } from '../components/Button'
import { GradeBadge } from '../components/GradeBadge'
import { shuffle } from '../lib/random'
import { xpFor } from '../lib/scoring'
import { useHotkeys } from '../lib/useHotkeys'

export function DropInDrill({ item, onResult, onNext }: DrillProps<DropInItem>) {
  const [options] = useState(() => shuffle(item.options))
  const [phase, setPhase] = useState<'fact' | 'choosing' | 'done'>('fact')
  const [picked, setPicked] = useState<number | null>(null)
  const [xp, setXp] = useState(0)
  const reduce = useReducedMotion()

  function choose(i: number) {
    if (phase !== 'choosing') return
    const grade = options[i].grade
    const gained = xpFor(grade)
    setPicked(i)
    setXp(gained)
    setPhase('done')
    onResult(grade, gained)
  }

  useHotkeys({ Enter: () => setPhase('choosing'), ' ': () => setPhase('choosing') }, phase === 'fact')
  useHotkeys({ '1': () => choose(0), '2': () => choose(1), '3': () => choose(2) }, phase === 'choosing')

  if (phase === 'fact') {
    return (
      <motion.div
        initial={reduce ? false : { rotateY: -8, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        className="flex flex-col gap-5"
      >
        <div className="rounded-3xl border-2 border-marigold bg-surface p-6">
          <p className="text-[13px] font-extrabold uppercase tracking-wider text-marigold-ink">Fact card</p>
          <p className="mt-3 font-display text-2xl font-extrabold leading-snug">{item.fact}</p>
          <p className="mt-4 text-xs text-muted">Source: {item.source}</p>
        </div>
        <p className="text-center text-sm text-muted">Remember it. Next, you'll drop it into a conversation.</p>
        <Button autoFocus onClick={() => setPhase('choosing')} className="w-full">
          Got it
        </Button>
      </motion.div>
    )
  }

  const done = phase === 'done'
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl border-b-4 border-[#3d1fa3] bg-[#5b2ee6] p-5 text-white">
        <p className="text-[13px] font-extrabold uppercase tracking-wider opacity-90">The moment</p>
        <p className="mt-2 font-display text-xl font-extrabold leading-snug">{item.prompt}</p>
      </div>
      <p className="text-sm text-muted">Which line uses the fact like a person, not a textbook?</p>
      <ol className="flex flex-col gap-3">
        {options.map((o, i) => {
          const mine = picked === i
          const ring = done
            ? o.grade === 'best'
              ? 'border-good bg-good-soft'
              : mine
                ? 'border-bad bg-bad-soft'
                : 'border-line bg-surface opacity-80'
            : 'border-line bg-surface hover:border-lake'
          return (
            <li key={o.text}>
              <button
                type="button"
                disabled={done}
                onClick={() => choose(i)}
                className={`flex w-full items-start gap-3 press rounded-2xl border-2 p-4 text-left ${ring}`}
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-bold text-muted">
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] leading-snug">“{o.text}”</span>
                  {done && (
                    <span className="mt-2 block text-sm text-muted">
                      <GradeBadge grade={o.grade} /> {o.why}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      {done && (
        <Feedback
          result={options[picked!].grade}
          xp={xp}
          pattern={item.pattern}
          save={{ text: item.options.find((o) => o.grade === 'best')!.text, pattern: item.pattern }}
          onNext={onNext}
        />
      )}
    </div>
  )
}
