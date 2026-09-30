import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { decks, decksBySection, deckItems, UNLOCK_THRESHOLD } from '../data'
import { mastery, unlockedDeckIds } from '../lib/session'
import { useProgress } from '../store/progress'
import { MasteryRing } from '../components/DeckIcon'
import { LockIcon } from '../components/icons'

export function Explore() {
  const progress = useProgress((s) => s.progress)
  const unlocked = unlockedDeckIds(decks, progress)
  const { hash } = useLocation()

  // Deep links like /explore#craft scroll to that section.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className="flex flex-col gap-8">
      <section className="pt-1">
        <h1 className="font-display text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-muted">
          Every section is open. Inside a section, the next deck unlocks at {Math.round(UNLOCK_THRESHOLD * 100)}% of
          the one before it.
        </p>
      </section>

      {decksBySection().map((s) => (
        <section key={s.id} id={s.id} className="flex scroll-mt-4 flex-col gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">{s.title}</h2>
            <p className="text-sm text-muted">{s.blurb}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {s.decks.map((d, i) => {
              const open = unlocked.has(d.id)
              const m = mastery(deckItems(d), progress)
              const count = deckItems(d).length
              const body = (
                <>
                  <MasteryRing value={m} icon={d.icon} locked={!open} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-tight">{d.title}</span>
                    <span className="block text-sm text-muted">{d.tagline}</span>
                    <span className="mt-1 block text-xs font-semibold text-muted">
                      {open
                        ? `${count} items · ${Math.round(m * 100)}% mastered`
                        : `Unlocks at ${Math.round(UNLOCK_THRESHOLD * 100)}% of ${s.decks[i - 1].title}`}
                    </span>
                  </span>
                  {!open && <LockIcon className="size-5 shrink-0 text-muted" />}
                </>
              )
              return (
                <li key={d.id}>
                  {open ? (
                    <Link
                      to={`/deck/${d.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-lake"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex items-center gap-4 rounded-2xl border border-dashed border-line p-4 opacity-70"
                    >
                      {body}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
