import { useEffect } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router'
import { decks, deckItems, getDeck } from '../data'
import { drillKinds, type DrillKind } from '../data/schema'
import { buildSession, dailyPool, reviewPool, SESSION_SIZE, unlockedDeckIds } from '../lib/session'
import { today } from '../lib/dates'
import { useProgress } from '../store/progress'
import { Session } from './Session'

export function Play() {
  const { deckId = '' } = useParams()
  const [params] = useSearchParams()
  const deck = getDeck(deckId)
  const raw = params.get('drill')
  const drill = drillKinds.includes(raw as DrillKind) ? (raw as DrillKind) : undefined
  const open = !!deck && unlockedDeckIds(decks, useProgress.getState().progress).has(deck.id)
  const setLastDeck = useProgress((s) => s.setLastDeck)

  useEffect(() => {
    if (deck && open) setLastDeck(deck.id)
  }, [deck, open, setLastDeck])

  if (!deck || !open) return <Navigate to="/explore" replace />

  return (
    <Session
      key={`${deck.id}-${drill ?? 'mixed'}`}
      title={deck.title}
      exitTo={`/deck/${deck.id}`}
      build={() => {
        const { progress, recentIds } = useProgress.getState()
        return buildSession(deckItems(deck, drill), progress, today(), SESSION_SIZE, Math.random, new Set(recentIds))
      }}
    />
  )
}

export function Daily() {
  return (
    <Session
      title="Daily 10"
      exitTo="/"
      build={() => {
        const { progress, recentIds } = useProgress.getState()
        return buildSession(dailyPool(decks, progress), progress, today(), SESSION_SIZE, Math.random, new Set(recentIds))
      }}
    />
  )
}

export function Review() {
  return (
    <Session
      title="Review"
      exitTo="/review"
      build={() => {
        const { progress } = useProgress.getState()
        const open = decks.filter((d) => unlockedDeckIds(decks, progress).has(d.id))
        return buildSession(reviewPool(open, progress, today()), progress, today())
      }}
    />
  )
}
