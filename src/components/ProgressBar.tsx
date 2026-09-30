export function ProgressBar({ value, label, tone = 'lake' }: { value: number; label: string; tone?: 'lake' | 'marigold' }) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-2 w-full overflow-hidden rounded-full bg-sunken"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${tone === 'lake' ? 'bg-lake' : 'bg-marigold'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
