import { Link, Navigate, useParams } from 'react-router'
import { decks, deckItems, getDeck, UNLOCK_THRESHOLD } from '../data'
import { drillInfo, drillKinds } from '../data/schema'
import { mastery, unlockedDeckIds } from '../lib/session'
import { isMastered } from '../lib/srs'
import { useProgress } from '../store/progress'
import { ProgressBar } from '../components/ProgressBar'
import { BackIcon } from '../components/icons'

export function DeckPage() {
  const { deckId = '' } = useParams()
  const progress = useProgress((s) => s.progress)
  const deck = getDeck(deckId)
  if (!deck || !unlockedDeckIds(decks, progress).has(deck.id)) return <Navigate to="/" replace />

  const m = mastery(deckItems(deck), progress)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="-ml-2 flex w-fit items-center gap-1 rounded-full px-2 py-1 text-sm text-muted hover:text-ink">
        <BackIcon className="size-4" /> All decks
      </Link>
      <section>
        <h1 className="font-display text-3xl font-bold leading-tight">{deck.title}</h1>
        <p className="mt-2 leading-relaxed text-muted">{deck.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={m} label="Deck mastery" tone="marigold" />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">{Math.round(m * 100)}% mastered</span>
        </div>
        {m < UNLOCK_THRESHOLD && deck.id !== decks.at(-1)!.id && (
          <p className="mt-2 text-xs text-muted">Reach {Math.round(UNLOCK_THRESHOLD * 100)}% to unlock the next deck.</p>
        )}
      </section>

      <Link
        to={`/play/${deck.id}`}
        className="flex min-h-14 items-center justify-center rounded-2xl bg-lake text-lg font-bold text-on-lake transition hover:opacity-90"
      >
        Start a mixed session
      </Link>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold">Or drill one skill</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {drillKinds.map((kind) => {
            const items = deckItems(deck, kind)
            const done = items.filter((s) => isMastered(progress[s.item.id])).length
            return (
              <Link
                key={kind}
                to={`/play/${deck.id}?drill=${kind}`}
                className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 transition hover:border-lake"
              >
                <span className="font-bold">{drillInfo[kind].name}</span>
                <span className="text-sm leading-snug text-muted">{drillInfo[kind].blurb}</span>
                <span className="mt-auto pt-1 text-xs font-semibold text-marigold-ink">
                  {done}/{items.length} mastered
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
