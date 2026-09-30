import { type Deck, type DrillKind, type SectionId, type SessionItem, drillKinds, sections } from './schema'
import { today } from '../lib/dates'

/**
 * Deck ids in unlock order within each section. Deck files live in ./decks and are
 * validated against ./validate by decks.test.ts, which `npm run build` runs first,
 * so the cast below is safe.
 */
export const DECK_ORDER = [
  'lakeside-cafe',
  'street-travel',
  'everyone-asks',
  'openers',
  'keep-it-flowing',
  'be-memorable',
  'cheeky-flirty',
  'playful-banter',
  'music-bands',
  'international-traveler',
  'whats-happening',
  'articulate-leader',
]

const files = import.meta.glob<Deck>('./decks/*.json', { eager: true, import: 'default' })
const byFile = new Map(Object.values(files).map((d) => [d.id, d]))

export const decks: Deck[] = DECK_ORDER.flatMap((id) => (byFile.has(id) ? [byFile.get(id)!] : []))

/** Share of a deck that must be mastered to unlock the next deck in the same section. */
export const UNLOCK_THRESHOLD = 0.6

export function getDeck(id: string): Deck | undefined {
  return decks.find((d) => d.id === id)
}

export function sectionDecks(section: SectionId): Deck[] {
  return decks.filter((d) => d.section === section)
}

/** Decks grouped by section, in display order. Sections with no decks are left out. */
export function decksBySection() {
  return sections.map((s) => ({ ...s, decks: sectionDecks(s.id) })).filter((s) => s.decks.length > 0)
}

function isLive(item: SessionItem['item'], on: string): boolean {
  return !('expires' in item) || !item.expires || item.expires >= on
}

/** Playable items of a deck. Dated items past their `expires` day are left out. */
export function deckItems(d: Deck, only?: DrillKind, on = today()): SessionItem[] {
  const kinds = only ? [only] : drillKinds
  return kinds.flatMap((kind) =>
    (d[kind] as SessionItem['item'][])
      .filter((item) => isLive(item, on))
      .map((item) => ({ kind, deckId: d.id, item }) as SessionItem),
  )
}

/** Every item in every deck, including expired ones. For tests and lookups. */
export const allItems: SessionItem[] = decks.flatMap((d) =>
  drillKinds.flatMap((kind) =>
    (d[kind] as SessionItem['item'][]).map((item) => ({ kind, deckId: d.id, item }) as SessionItem),
  ),
)

const byId = new Map(allItems.map((s) => [s.item.id, s]))

export function findItem(id: string): SessionItem | undefined {
  return byId.get(id)
}
