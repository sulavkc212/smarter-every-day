import { Link, Navigate, useParams } from 'react-router'
import { decks, deckItems, getDeck, sectionDecks, UNLOCK_THRESHOLD } from '../data'
import { drillInfo, drillKinds, sections } from '../data/schema'
import { mastery, unlockedDeckIds } from '../lib/session'
import { isMastered } from '../lib/srs'
import { useProgress } from '../store/progress'
import { MasteryRing } from '../components/DeckIcon'
import { BackIcon } from '../components/icons'

export function DeckPage() {
  const { deckId = '' } = useParams()
  const progress = useProgress((s) => s.progress)
  const deck = getDeck(deckId)
  if (!deck || !unlockedDeckIds(decks, progress).has(deck.id)) return <Navigate to="/explore" replace />

  const m = mastery(deckItems(deck), progress)
  const section = sections.find((s) => s.id === deck.section)!
  const siblings = sectionDecks(deck.section)
  const next = siblings[siblings.findIndex((d) => d.id === deck.id) + 1]
  const kinds = drillKinds.filter((k) => deckItems(deck, k).length > 0)

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/explore#${section.id}`}
        className="-ml-2 flex w-fit items-center gap-1 rounded-full px-2 py-1 text-sm text-muted hover:text-ink"
      >
        <BackIcon className="size-4" /> {section.title}
      </Link>
      <section className="flex items-start gap-4">
        <MasteryRing value={m} icon={deck.icon} color={section.color} />
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-black leading-tight">{deck.title}</h1>
          <p className="mt-1 text-sm font-extrabold" style={{ color: section.color }}>{Math.round(m * 100)}% mastered</p>
        </div>
      </section>
      <p className="-mt-2 leading-relaxed text-muted">{deck.description}</p>
      {next && m < UNLOCK_THRESHOLD && (
        <p className="-mt-3 text-sm font-bold text-muted">
          Reach {Math.round(UNLOCK_THRESHOLD * 100)}% to unlock {next.title}.
        </p>
      )}

      <Link
        to={`/play/${deck.id}`}
        className="flex min-h-14 items-center justify-center press rounded-2xl border-lake-edge bg-lake text-lg font-extrabold text-on-lake"
      >
        Start a mixed session
      </Link>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-black">Or drill one skill</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {kinds.map((kind) => {
            const items = deckItems(deck, kind)
            const done = items.filter((s) => isMastered(progress[s.item.id])).length
            return (
              <Link
                key={kind}
                to={`/play/${deck.id}?drill=${kind}`}
                className="flex flex-col gap-2 press rounded-2xl border-2 border-line border-b-edge bg-surface p-4 hover:border-lake"
              >
                <span className="text-lg font-extrabold">{drillInfo[kind].name}</span>
                <span className="text-sm leading-snug text-muted">{drillInfo[kind].blurb}</span>
                <span className="mt-auto pt-1 text-sm font-extrabold" style={{ color: section.color }}>
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
