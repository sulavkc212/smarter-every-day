import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Result } from '../lib/srs'
import { Button } from '../components/Button'
import { PatternChip } from '../components/GradeBadge'
import { useHotkeys } from '../lib/useHotkeys'

const headline: Record<Result | 'timeout', { text: string; cls: string }> = {
  best: { text: 'Nailed it', cls: 'bg-good-soft text-good' },
  okay: { text: 'Close — not quite', cls: 'bg-meh-soft text-meh' },
  miss: { text: 'Not that one', cls: 'bg-bad-soft text-bad' },
  timeout: { text: "Time's up", cls: 'bg-bad-soft text-bad' },
}

export function Feedback({
  result,
  timedOut = false,
  xp,
  pattern,
  why,
  onNext,
  children,
}: {
  result: Result
  timedOut?: boolean
  xp: number
  pattern?: string
  why?: string
  onNext: () => void
  children?: ReactNode
}) {
  const reduce = useReducedMotion()
  const h = headline[timedOut ? 'timeout' : result]
  useHotkeys({ Enter: onNext, ' ': onNext })

  return (
    <motion.section
      aria-live="polite"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4"
    >
      <div className={`flex items-center justify-between rounded-2xl px-4 py-3 font-bold ${h.cls}`}>
        <span className="text-lg">{h.text}</span>
        {xp > 0 && <span className="text-sm">+{xp} XP</span>}
      </div>
      {pattern && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Pattern</span>
          <PatternChip pattern={pattern} />
        </div>
      )}
      {why && <p className="text-[15px] leading-relaxed text-ink">{why}</p>}
      {children}
      <Button autoFocus onClick={onNext} className="w-full">
        Continue
      </Button>
    </motion.section>
  )
}
