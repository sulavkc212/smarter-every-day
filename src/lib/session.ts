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

/**
 * The first deck of every section is always open. Each later deck opens when the
 * deck before it in the same section is mastered enough.
 */
export function unlockedDeckIds(ds: Deck[], progress: ProgressMap): Set<string> {
  const open = new Set<string>()
  const blocked = new Set<string>()
  const previous = new Map<string, Deck>()
  for (const d of ds) {
    const prev = previous.get(d.section)
    previous.set(d.section, d)
    if (blocked.has(d.section)) continue
    if (!prev || mastery(deckItems(prev), progress) >= UNLOCK_THRESHOLD) open.add(d.id)
    else blocked.add(d.section)
  }
  return open
}

/** The deck a learner should play next: the least-mastered open deck, preferring Everyday Talk. */
export function nextUpDeck(ds: Deck[], progress: ProgressMap): Deck | undefined {
  const open = unlockedDeckIds(ds, progress)
  const candidates = ds.filter((d) => open.has(d.id))
  const unfinished = candidates.filter((d) => mastery(deckItems(d), progress) < UNLOCK_THRESHOLD)
  return (unfinished.length > 0 ? unfinished : candidates)[0]
}

/** Pool for the Daily 10: everything in the open decks. `buildSession` puts due reviews first. */
export function dailyPool(ds: Deck[], progress: ProgressMap): SessionItem[] {
  const open = unlockedDeckIds(ds, progress)
  return ds.filter((d) => open.has(d.id)).flatMap((d) => deckItems(d))
}
