/** Small line icons for decks. Keys match the `icon` field in deck JSON. */
const paths: Record<string, string> = {
  cup: 'M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Zm11 1h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1 1 1 1 2M11 3.5c0 1 1 1 1 2',
  bus: 'M6 17V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11M6 17h12M6 11h12M8 17v2m8-2v2M9 14h.01M15 14h.01',
  question: 'M9 9a3 3 0 1 1 4.2 2.7c-.8.4-1.2 1-1.2 1.8v.5M12 17.5h.01M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0',
  wave: 'M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1V5a1.5 1.5 0 0 1 3 0v6m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v3a7 7 0 0 1-12.6 4.2L4.5 15a1.5 1.5 0 0 1 2.3-1.9L7 13.5',
  flow: 'M4 8c3 0 3-3 6-3s3 3 6 3 3-3 4-3M4 13c3 0 3-3 6-3s3 3 6 3 3-3 4-3M4 18c3 0 3-3 6-3s3 3 6 3 3-3 4-3',
  star: 'm12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  spark: 'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6',
  music: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
  news: 'M5 5h11v14H6a1 1 0 0 1-1-1V5Zm11 4h3v9a1 1 0 0 1-1 1h-2M8 9h5M8 12h5M8 15h3',
  flag: 'M5 21V4m0 0h11l-2 4 2 4H5',
}

export function DeckIcon({ icon, className = 'size-6' }: { icon: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[icon] ?? paths.star} />
    </svg>
  )
}

/** Circular mastery indicator with the deck icon in the middle. */
export function MasteryRing({
  value,
  icon,
  color = 'var(--lake)',
  locked = false,
}: {
  value: number
  icon: string
  /** Section colour (a CSS colour or variable). */
  color?: string
  locked?: boolean
}) {
  const r = 22
  const c = 2 * Math.PI * r
  const pct = Math.min(Math.max(value, 0), 1)
  const tint = locked ? 'var(--sunken)' : color
  return (
    <span className="relative inline-flex size-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 52 52" className="absolute inset-0 size-14 -rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r="17" fill={tint} fillOpacity={locked ? 1 : 0.16} />
        <circle cx="26" cy="26" r={r} fill="none" stroke="var(--sunken)" strokeWidth="5" />
        {!locked && pct > 0 && (
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        )}
      </svg>
      <span className="relative" style={{ color: locked ? 'var(--muted)' : color }}>
        <DeckIcon icon={icon} className="size-6" />
      </span>
    </span>
  )
}
