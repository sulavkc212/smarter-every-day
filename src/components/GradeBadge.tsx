import type { Grade } from '../data/schema'

const look: Record<Grade, { label: string; cls: string }> = {
  best: { label: 'Best', cls: 'bg-good-soft text-good' },
  okay: { label: 'Okay', cls: 'bg-meh-soft text-meh' },
  miss: { label: 'Miss', cls: 'bg-bad-soft text-bad' },
}

export function GradeBadge({ grade }: { grade: Grade }) {
  const { label, cls } = look[grade]
  return (
    <span className={`inline-block rounded-lg px-2 py-0.5 text-xs font-black uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  )
}

export function PatternChip({ pattern }: { pattern: string }) {
  return (
    <span className="inline-block rounded-xl bg-lake-soft px-3 py-1 text-sm font-extrabold text-lake">{pattern}</span>
  )
}
