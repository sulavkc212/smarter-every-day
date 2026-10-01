import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { currentStreak, useProgress } from '../store/progress'
import { CompassIcon, FlameIcon, RepeatIcon, StarIcon, SunIcon, UserIcon } from './icons'

const tabs = [
  { to: '/', label: 'Today', Icon: SunIcon, end: true },
  { to: '/explore', label: 'Explore', Icon: CompassIcon, end: false },
  { to: '/review', label: 'Review', Icon: RepeatIcon, end: true },
  { to: '/me', label: 'Me', Icon: UserIcon, end: false },
]

export function Layout() {
  const xp = useProgress((s) => s.xp)
  const streak = currentStreak(useProgress((s) => s.streak))
  const { pathname } = useLocation()
  // Sessions get the whole screen: no tab bar while playing.
  const playing = pathname.startsWith('/play') || pathname.startsWith('/review/play')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4">
      <header className="flex items-center justify-between gap-3 py-4">
        <Link to="/" className="font-display text-xl font-black tracking-tight text-ink">
          Smarter <span className="text-lake">Everyday</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {!playing &&
            tabs.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-extrabold transition ${
                    isActive ? 'bg-lake text-on-lake' : 'text-muted hover:bg-sunken hover:text-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
        </nav>
        <div className="flex items-center gap-2 text-base font-black">
          <span className="flex items-center gap-1 rounded-full border-2 border-line bg-surface px-3 py-1 text-[var(--sec-everyday)]" title="Day streak">
            <FlameIcon className="size-5" />
            <span aria-label={`${streak} day streak`}>{streak}</span>
          </span>
          <span className="flex items-center gap-1 rounded-full border-2 border-line bg-surface px-3 py-1 text-lake" title="Experience points">
            <StarIcon className="size-5" />
            <span aria-label={`${xp} XP`}>{xp}</span>
          </span>
        </div>
      </header>

      <main className={`flex flex-1 flex-col ${playing ? 'pb-10' : 'pb-28 sm:pb-10'}`}>
        <ScrollRestoration />
        <Outlet />
      </main>

      {!playing && (
        <nav
          aria-label="Tabs"
          className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-line bg-surface sm:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <ul className="mx-auto grid max-w-xl grid-cols-4">
            {tabs.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-h-16 flex-col items-center justify-center gap-0.5 text-[13px] font-extrabold transition ${
                      isActive ? 'text-lake' : 'text-muted'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`rounded-2xl px-5 py-1 ${isActive ? 'bg-lake text-on-lake' : ''}`}>
                        <Icon className="size-6" />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
