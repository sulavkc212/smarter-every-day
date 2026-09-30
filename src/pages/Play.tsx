import { Navigate, useParams, useSearchParams } from 'react-router'
import { decks, deckItems, getDeck } from '../data'
import { drillKinds, type DrillKind } from '../data/schema'
import { buildSession, reviewPool, unlockedDeckIds } from '../lib/session'
import { today } from '../lib/dates'
import { useProgress } from '../store/progress'
import { Session } from './Session'

export function Play() {
  const { deckId = '' } = useParams()
  const [params] = useSearchParams()
  const deck = getDeck(deckId)
  const raw = params.get('drill')
  const drill = drillKinds.includes(raw as DrillKind) ? (raw as DrillKind) : undefined

  if (!deck || !unlockedDeckIds(decks, useProgress.getState().progress).has(deck.id)) {
    return <Navigate to="/" replace />
  }

  return (
    <Session
      key={`${deck.id}-${drill ?? 'mixed'}`}
      title={deck.title}
      exitTo={`/deck/${deck.id}`}
      build={() => buildSession(deckItems(deck, drill), useProgress.getState().progress, today())}
    />
  )
}

export function Review() {
  return (
    <Session
      title="Review"
      exitTo="/"
      build={() => {
        const { progress } = useProgress.getState()
        const open = decks.filter((d) => unlockedDeckIds(decks, progress).has(d.id))
        return buildSession(reviewPool(open, progress, today()), progress, today())
      }}
    />
  )
}
