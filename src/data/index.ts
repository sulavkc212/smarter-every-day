import { type Deck, type DrillKind, type SessionItem, drillKinds } from './schema'
import lakesideCafe from './decks/lakeside-cafe.json'
import cheekyFlirty from './decks/cheeky-flirty.json'
import articulateLeader from './decks/articulate-leader.json'
import internationalTraveler from './decks/international-traveler.json'

/**
 * Decks in unlock order. Validated against ./validate by decks.test.ts,
 * which `npm run build` runs first, so the cast is safe.
 */
export const decks = [lakesideCafe, cheekyFlirty, articulateLeader, internationalTraveler] as Deck[]

/** Share of a deck's items that must be mastered to unlock the next deck. */
export const UNLOCK_THRESHOLD = 0.7

export function getDeck(id: string): Deck | undefined {
  return decks.find((d) => d.id === id)
}

export function deckItems(d: Deck, only?: DrillKind): SessionItem[] {
  const kinds = only ? [only] : drillKinds
  return kinds.flatMap((kind) =>
    (d[kind] as SessionItem['item'][]).map((item) => ({ kind, deckId: d.id, item }) as SessionItem),
  )
}

export const allItems: SessionItem[] = decks.flatMap((d) => deckItems(d))

const byId = new Map(allItems.map((s) => [s.item.id, s]))

export function findItem(id: string): SessionItem | undefined {
  return byId.get(id)
}
