import type { Deck } from '../data/schema'
import { hashString } from './random'

export interface Line {
  text: string
  pattern: string
  deckTitle: string
}

/** One strong line per day from the unlocked decks, stable for the whole day. */
export function lineOfDay(ds: Deck[], day: string): Line | undefined {
  const lines: Line[] = ds.flatMap((d) => [
    ...d.vibe.flatMap((v) =>
      v.options.filter((o) => o.grade === 'best').map((o) => ({ text: o.text, pattern: v.pattern, deckTitle: d.title })),
    ),
    ...d.yesAnd.flatMap((y) =>
      y.cards.filter((c) => c.keepsGoing).map((c) => ({ text: c.text, pattern: y.pattern, deckTitle: d.title })),
    ),
  ])
  if (lines.length === 0) return undefined
  return lines[hashString(day) % lines.length]
}
