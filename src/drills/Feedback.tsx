import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Result } from '../lib/srs'
import { Button } from '../components/Button'
import { PatternChip } from '../components/GradeBadge'
import { useHotkeys } from '../lib/useHotkeys'
import { useProgress, type SavedLine } from '../store/progress'
import { StarIcon } from '../components/icons'

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
  save,
  onNext,
  children,
}: {
  result: Result
  timedOut?: boolean
  xp: number
  pattern?: string
  why?: string
  /** The model line for this item, offered for the learner's phrasebook. */
  save?: SavedLine
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
      {save && <SaveLineButton line={save} />}
      <Button autoFocus onClick={onNext} className="w-full">
        Continue
      </Button>
    </motion.section>
  )
}

export function SaveLineButton({ line }: { line: SavedLine }) {
  const saved = useProgress((s) => s.saved.some((l) => l.text === line.text))
  const toggle = useProgress((s) => s.toggleSaved)
  return (
    <button
      type="button"
      onClick={() => toggle(line)}
      aria-pressed={saved}
      className={`flex items-start gap-3 rounded-2xl border p-3 text-left text-sm transition ${
        saved ? 'border-marigold bg-meh-soft' : 'border-line bg-surface hover:border-marigold'
      }`}
    >
      <StarIcon className={`mt-0.5 size-5 shrink-0 ${saved ? 'text-marigold' : 'text-muted'}`} />
      <span>
        <span className="block font-semibold">{saved ? 'Saved to your lines' : 'Save this line'}</span>
        <span className="block text-muted">“{line.text}”</span>
      </span>
    </button>
  )
}
