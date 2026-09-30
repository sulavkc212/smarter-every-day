import { useEffect, useRef, useState } from 'react'
import type { VibeItem } from '../data/schema'
import type { DrillProps } from './types'
import { Feedback } from './Feedback'
import { GradeBadge } from '../components/GradeBadge'
import { shuffle } from '../lib/random'
import { vibeSeconds, xpFor } from '../lib/scoring'
import { useHotkeys } from '../lib/useHotkeys'
import { useProgress } from '../store/progress'

/** Time to read the scene before the options and clock appear. */
export const READ_MS = 1500

type Phase = 'reading' | 'choosing' | 'done'

export function VibeDrill({ item, onResult, onNext }: DrillProps<VibeItem>) {
  const [options] = useState(() => shuffle(item.options))
  const [seconds] = useState(() => {
    const s = useProgress.getState()
    return vibeSeconds(s.recentVibe, s.relaxedTimer)
  })
  const [phase, setPhase] = useState<Phase>('reading')
  const [picked, setPicked] = useState<number | null>(null)
  const [xp, setXp] = useState(0)
  const startedAt = useRef(0)
  // Keep the timer effect independent of the parent's callback identity.
  const report = useRef(onResult)
  useEffect(() => {
    report.current = onResult
  })

  useEffect(() => {
    if (phase === 'reading') {
      const t = setTimeout(() => {
        startedAt.current = performance.now()
        setPhase('choosing')
      }, READ_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'choosing') {
      const t = setTimeout(() => {
        setPhase('done')
        report.current('miss', 0)
      }, seconds * 1000)
      return () => clearTimeout(t)
    }
  }, [phase, seconds])

  function choose(i: number) {
    if (phase !== 'choosing') return
    // oxlint-disable-next-line react/purity -- runs in an event handler, not during render
    const elapsed = (performance.now() - startedAt.current) / 1000
    const grade = options[i].grade
    const gained = xpFor(grade, 1 - elapsed / seconds)
    setPicked(i)
    setXp(gained)
    setPhase('done')
    onResult(grade, gained)
  }

  useHotkeys({ '1': () => choose(0), '2': () => choose(1), '3': () => choose(2) }, phase === 'choosing')

  const result = picked === null ? 'miss' : options[picked].grade

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-lake p-5 text-on-lake">
        <p className="text-xs font-bold uppercase tracking-widest opacity-75">{item.setting}</p>
        <p className="mt-2 font-display text-xl leading-snug">{item.scenario}</p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
        {phase === 'choosing' && (
          <div className="timer-fill h-full bg-marigold" style={{ animationDuration: `${seconds}s` }} />
        )}
        {phase === 'reading' && <div className="h-full w-full bg-marigold/40" />}
      </div>
      <p className="sr-only" aria-live="polite">
        {phase === 'choosing' ? `You have ${seconds} seconds. Press 1, 2 or 3.` : ''}
      </p>

      {phase === 'reading' ? (
        <p className="py-8 text-center text-muted">Read the room…</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {options.map((o, i) => {
            const done = phase === 'done'
            const mine = picked === i
            const ring = done
              ? o.grade === 'best'
                ? 'border-good bg-good-soft'
                : mine
                  ? 'border-bad bg-bad-soft'
                  : 'border-line bg-surface opacity-70'
              : 'border-line bg-surface hover:border-lake active:scale-[0.99]'
            return (
              <li key={o.text}>
                <button
                  type="button"
                  disabled={done}
                  onClick={() => choose(i)}
                  className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${ring}`}
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-bold text-muted">
                    {i + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] leading-snug">“{o.text}”</span>
                    {done && (
                      <span className="mt-2 flex items-center gap-2 text-xs text-muted">
                        <GradeBadge grade={o.grade} /> {o.tone}
                        {mine && <strong className="text-ink">· your pick</strong>}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}

      {phase === 'done' && (
        <Feedback
          result={result}
          timedOut={picked === null}
          xp={xp}
          pattern={item.pattern}
          why={item.why}
          onNext={onNext}
        />
      )}
    </div>
  )
}
