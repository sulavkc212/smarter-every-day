import { Link } from 'react-router'
import { decks, deckItems, UNLOCK_THRESHOLD } from '../data'
import { mastery, reviewPool, unlockedDeckIds } from '../lib/session'
import { lineOfDay } from '../lib/lineOfDay'
import { today } from '../lib/dates'
import { LINE_XP, useProgress } from '../store/progress'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from '../components/Button'
import { PatternChip } from '../components/GradeBadge'
import { CheckIcon, LockIcon } from '../components/icons'

export function Home() {
  const progress = useProgress((s) => s.progress)
  const lineUsedOn = useProgress((s) => s.lineUsedOn)
  const markLineUsed = useProgress((s) => s.markLineUsed)
  const day = today()

  const unlocked = unlockedDeckIds(decks, progress)
  const open = decks.filter((d) => unlocked.has(d.id))
  const due = reviewPool(open, progress, day).length
  const line = lineOfDay(open, day)
  const usedToday = lineUsedOn === day

  return (
    <div className="flex flex-col gap-6">
      <section className="pt-2">
        <h1 className="font-display text-3xl font-bold leading-tight">Namaste.</h1>
        <p className="mt-1 text-muted">Three minutes a day. Quicker, warmer, clearer by the week.</p>
      </section>

      {line && (
        <section className="rounded-3xl border-2 border-marigold bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-marigold-ink">Line of the day</p>
          <p className="mt-2 font-display text-xl leading-snug">“{line.text}”</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PatternChip pattern={line.pattern} />
          </div>
          <p className="mt-3 text-sm text-muted">Use this pattern once in a real conversation today, in your own words.</p>
          <Button
            variant={usedToday ? 'secondary' : 'primary'}
            onClick={markLineUsed}
            disabled={usedToday}
            className="mt-4 w-full"
          >
            {usedToday ? (
              <>
                <CheckIcon /> Used it today
              </>
            ) : (
              `I used it (+${LINE_XP} XP)`
            )}
          </Button>
        </section>
      )}

      {due > 0 && (
        <Link
          to="/review"
          className="flex items-center justify-between rounded-3xl bg-lake p-5 text-on-lake transition hover:opacity-95"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest opacity-75">Review</span>
            <span className="mt-1 block font-display text-xl">
              {due} {due === 1 ? 'item' : 'items'} ready to revisit
            </span>
          </span>
          <span className="rounded-full bg-marigold px-4 py-2 text-sm font-bold text-lake">Go</span>
        </Link>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold">Decks</h2>
        {decks.map((d, i) => {
          const isOpen = unlocked.has(d.id)
          const m = mastery(deckItems(d), progress)
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Deck {i + 1}</p>
                  <h3 className="font-display text-xl font-bold">{d.title}</h3>
                  <p className="text-sm text-muted">{d.tagline}</p>
                </div>
                {!isOpen && <LockIcon className="mt-1 size-5 shrink-0 text-muted" />}
              </div>
              {isOpen ? (
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={m} label={`${d.title} mastery`} tone="marigold" />
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">{Math.round(m * 100)}%</span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted">
                  Unlocks at {Math.round(UNLOCK_THRESHOLD * 100)}% mastery of {decks[i - 1].title}.
                </p>
              )}
            </>
          )
          return isOpen ? (
            <Link
              key={d.id}
              to={`/deck/${d.id}`}
              className="rounded-3xl border border-line bg-surface p-5 transition hover:border-lake"
            >
              {body}
            </Link>
          ) : (
            <div key={d.id} aria-disabled="true" className="rounded-3xl border border-dashed border-line p-5 opacity-60">
              {body}
            </div>
          )
        })}
      </section>
    </div>
  )
}
