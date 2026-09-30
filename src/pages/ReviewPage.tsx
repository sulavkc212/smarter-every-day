import { Link } from 'react-router'
import { decks } from '../data'
import { reviewPool, unlockedDeckIds } from '../lib/session'
import { today } from '../lib/dates'
import { useProgress } from '../store/progress'
import { PatternChip } from '../components/GradeBadge'
import { PlayIcon, StarIcon } from '../components/icons'

export function ReviewPage() {
  const progress = useProgress((s) => s.progress)
  const saved = useProgress((s) => s.saved)
  const toggleSaved = useProgress((s) => s.toggleSaved)
  const open = decks.filter((d) => unlockedDeckIds(decks, progress).has(d.id))
  const due = reviewPool(open, progress, today()).length

  return (
    <div className="flex flex-col gap-6">
      <section className="pt-1">
        <h1 className="font-display text-3xl font-bold">Review</h1>
        <p className="mt-1 text-muted">Missed items come back here until they stick. Items you get right return less often.</p>
      </section>

      {due > 0 ? (
        <Link
          to="/review/play"
          className="flex items-center justify-between gap-4 rounded-3xl bg-lake p-5 text-on-lake transition hover:opacity-95"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest opacity-75">Due now</span>
            <span className="mt-1 block font-display text-2xl font-bold">
              {due} {due === 1 ? 'item' : 'items'} to revisit
            </span>
          </span>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-marigold text-lake">
            <PlayIcon className="size-5 translate-x-0.5" />
          </span>
        </Link>
      ) : (
        <p className="rounded-2xl bg-surface p-4 text-muted">
          Nothing due right now. Play a deck or the Daily 10, and anything you miss will show up here.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Your saved lines</h2>
          <p className="text-sm text-muted">Tap “Save this line” after any answer to collect lines you want to use.</p>
        </div>
        {saved.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">No saved lines yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {saved.map((l) => (
              <li key={l.text} className="flex items-start gap-3 rounded-2xl bg-surface p-4">
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-snug">“{l.text}”</span>
                  {l.pattern && (
                    <span className="mt-2 block">
                      <PatternChip pattern={l.pattern} />
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSaved(l)}
                  aria-label="Remove from saved lines"
                  className="rounded-full p-2 text-marigold hover:bg-sunken"
                >
                  <StarIcon className="size-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
