import type { Deck, SessionItem } from '../data/schema'
import { deckItems, UNLOCK_THRESHOLD } from '../data'
import { isDue, isMastered, type ItemProgress } from './srs'
import { shuffle, type Rng } from './random'

export const SESSION_SIZE = 10

type ProgressMap = Record<string, ItemProgress | undefined>

/**
 * Pick a session from a pool: items due for review first, then unseen items,
 * then the weakest of the rest. The picked set is shuffled so drills mix.
 */
export function buildSession(
  pool: SessionItem[],
  progress: ProgressMap,
  on: string,
  size = SESSION_SIZE,
  rng: Rng = Math.random,
): SessionItem[] {
  const shuffled = shuffle(pool, rng)
  const p = (s: SessionItem) => progress[s.item.id]
  const due = shuffled.filter((s) => isDue(p(s), on)).sort((a, b) => p(a)!.box - p(b)!.box)
  const unseen = shuffled.filter((s) => !p(s) || p(s)!.box === 0)
  const rest = shuffled
    .filter((s) => p(s) && p(s)!.box > 0 && !isDue(p(s), on))
    .sort((a, b) => p(a)!.box - p(b)!.box || p(a)!.lastSeen.localeCompare(p(b)!.lastSeen))
  return shuffle([...due, ...unseen, ...rest].slice(0, size), rng)
}

/** Items due for review, across the given decks. */
export function reviewPool(ds: Deck[], progress: ProgressMap, on: string): SessionItem[] {
  return ds.flatMap((d) => deckItems(d)).filter((s) => isDue(progress[s.item.id], on))
}

export function mastery(items: SessionItem[], progress: ProgressMap): number {
  if (items.length === 0) return 0
  return items.filter((s) => isMastered(progress[s.item.id])).length / items.length
}

/** The first deck is always open; each later deck opens when the one before it is mastered enough. */
export function unlockedDeckIds(ds: Deck[], progress: ProgressMap): Set<string> {
  const open = new Set<string>()
  for (const [i, d] of ds.entries()) {
    if (i === 0 || mastery(deckItems(ds[i - 1]), progress) >= UNLOCK_THRESHOLD) open.add(d.id)
    else break
  }
  return open
}
