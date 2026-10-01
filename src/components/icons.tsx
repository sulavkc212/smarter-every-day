type P = { className?: string }

export const FlameIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.8 0 2.7-1.6 2.2-3.8C17.6 10 19 12.6 19 15a7 7 0 1 1-14 0c0-4.4 3.6-6.8 7-13Z" />
  </svg>
)

export const StarIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="m12 2.5 2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8L12 2.5Z" />
  </svg>
)

export const LockIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
  </svg>
)

export const BackIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

export const GearIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
)

export const XIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const CheckIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={className}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
)

function Line({ d, className = 'size-6' }: P & { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={d} />
    </svg>
  )
}

export const SunIcon = (p: P) => <Line d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m11.4 1.4-1.4-1.4M6.3 6.3 4.9 4.9M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" {...p} />
export const CompassIcon = (p: P) => <Line d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z" {...p} />
export const RepeatIcon = (p: P) => <Line d="M17 2l3 3-3 3M20 5H9a5 5 0 0 0-5 5v1m3 11-3-3 3-3m-3 3h11a5 5 0 0 0 5-5v-1" {...p} />
export const UserIcon = (p: P) => <Line d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" {...p} />
export const PlayIcon = (p: P) => <Line d="M7 4.5v15l12-7.5-12-7.5Z" {...p} />
export const ArrowIcon = (p: P) => <Line d="M5 12h14m-6-6 6 6-6 6" {...p} />
export const FlagIcon = ({ className = 'size-5', filled = false }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M5 21V4m0 0h12l-2.5 4.5L17 13H5" />
  </svg>
)
