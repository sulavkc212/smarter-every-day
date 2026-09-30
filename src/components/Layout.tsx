import { Link, Outlet } from 'react-router'
import { currentStreak, useProgress } from '../store/progress'
import { FlameIcon, GearIcon, StarIcon } from './icons'

export function Layout() {
  const xp = useProgress((s) => s.xp)
  const streak = currentStreak(useProgress((s) => s.streak))

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-10">
      <header className="flex items-center justify-between gap-3 py-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">
          Smarter <span className="text-marigold-ink">Everyday</span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-marigold-ink" title="Day streak">
            <FlameIcon className="size-4" />
            <span aria-label={`${streak} day streak`}>{streak}</span>
          </span>
          <span className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-lake" title="Experience points">
            <StarIcon className="size-4" />
            <span aria-label={`${xp} XP`}>{xp}</span>
          </span>
          <Link to="/settings" className="rounded-full p-2 text-muted hover:bg-sunken hover:text-ink" aria-label="Settings">
            <GearIcon />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
