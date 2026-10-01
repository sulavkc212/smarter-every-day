import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Result } from '../lib/srs'
import { Button } from '../components/Button'
import { PatternChip } from '../components/GradeBadge'
import { useHotkeys } from '../lib/useHotkeys'
import { useProgress, type SavedLine } from '../store/progress'
import { StarIcon } from '../components/icons'

// Solid, fixed colours so the result reads instantly in light and dark mode (all ≥ 4.5:1).
const headline: Record<Result | 'timeout', { text: string; cls: string }> = {
  best: { text: 'Nailed it!', cls: 'bg-[#15803d] text-white' },
  okay: { text: 'Close — not quite', cls: 'bg-[#ffb21e] text-[#14142b]' },
  miss: { text: 'Not that one', cls: 'bg-[#dc2626] text-white' },
  timeout: { text: "Time's up!", cls: 'bg-[#dc2626] text-white' },
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
      <div className={`flex items-center justify-between rounded-2xl px-5 py-4 ${h.cls}`}>
        <span className="text-xl font-black">{h.text}</span>
        {xp > 0 && <span className="rounded-full bg-black/15 px-3 py-1 text-sm font-extrabold">+{xp} XP</span>}
      </div>
      {pattern && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-muted">Pattern</span>
          <PatternChip pattern={pattern} />
        </div>
      )}
      {why && <p className="text-base leading-relaxed text-ink">{why}</p>}
      {children}
      {save && <SaveLineButton line={save} />}
      <Button autoFocus variant={result === 'best' && !timedOut ? 'success' : 'primary'} onClick={onNext} className="w-full">
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
      className={`press flex items-start gap-3 rounded-2xl border-2 p-3 text-left text-sm ${
        saved ? 'border-marigold border-b-marigold-edge bg-meh-soft' : 'border-line border-b-edge bg-surface hover:border-marigold'
      }`}
    >
      <StarIcon className={`mt-0.5 size-6 shrink-0 ${saved ? 'text-marigold' : 'text-muted'}`} />
      <span>
        <span className="block font-extrabold">{saved ? 'Saved to your lines' : 'Save this line'}</span>
        <span className="block text-muted">“{line.text}”</span>
      </span>
    </button>
  )
}
