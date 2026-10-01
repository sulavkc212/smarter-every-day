import type { Deck, SessionItem } from '../data/schema'
import { deckItems, UNLOCK_THRESHOLD } from '../data'
import { isDue, isMastered, type ItemProgress } from './srs'
import { shuffle, type Rng } from './random'

export const SESSION_SIZE = 10

type ProgressMap = Record<string, ItemProgress | undefined>

/** Group items by drill kind, keeping their order within each kind. */
function byKind(items: SessionItem[]): Map<string, SessionItem[]> {
  const groups = new Map<string, SessionItem[]>()
  for (const s of items) groups.set(s.kind, [...(groups.get(s.kind) ?? []), s])
  return groups
}

/**
 * Take up to `n` items, one kind at a time in turn, so a round spreads across all drills.
 * `items` arrive in priority order; the kind holding the most urgent item goes first.
 */
function roundRobin(items: SessionItem[], n: number): SessionItem[] {
  const queues = [...byKind(items).values()]
  const out: SessionItem[] = []
  while (out.length < n && queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      if (out.length >= n) break
      const next = q.shift()
      if (next) out.push(next)
    }
  }
  return out
}

/** Order a round so the same drill kind never comes twice in a row when it can be avoided. */
export function interleave(items: SessionItem[], rng: Rng = Math.random): SessionItem[] {
  const groups = [...byKind(shuffle(items, rng)).values()]
  const out: SessionItem[] = []
  while (groups.some((g) => g.length > 0)) {
    const last = out.at(-1)?.kind
    const candidates = groups.filter((g) => g.length > 0 && g[0].kind !== last)
    const pool = candidates.length > 0 ? candidates : groups.filter((g) => g.length > 0)
    // Prefer the kind with the most left, so we don't strand a pile of one kind at the end.
    const most = Math.max(...pool.map((g) => g.length))
    const tied = pool.filter((g) => g.length === most)
    out.push(tied[Math.floor(rng() * tied.length)].shift()!)
  }
  return out
}

/**
 * Pick a session from a pool: items due for review first, then unseen items,
 * then the weakest of the rest. Picks are spread across drill kinds and
 * interleaved so the same drill never comes twice in a row.
 *
 * `avoid` holds recently played item ids. They are only used when the pool
 * can't fill the round without them, so "Another round" brings new questions.
 */
export function buildSession(
  pool: SessionItem[],
  progress: ProgressMap,
  on: string,
  size = SESSION_SIZE,
  rng: Rng = Math.random,
  avoid: ReadonlySet<string> = new Set(),
): SessionItem[] {
  const shuffled = shuffle(pool, rng)
  const p = (s: SessionItem) => progress[s.item.id]
  const due = shuffled.filter((s) => isDue(p(s), on)).sort((a, b) => p(a)!.box - p(b)!.box)
  const unseen = shuffled.filter((s) => !p(s) || p(s)!.box === 0)
  const rest = shuffled
    .filter((s) => p(s) && p(s)!.box > 0 && !isDue(p(s), on))
    .sort((a, b) => p(a)!.box - p(b)!.box || p(a)!.lastSeen.localeCompare(p(b)!.lastSeen))
  const ranked = [...due, ...unseen, ...rest]

  const fresh = ranked.filter((s) => !avoid.has(s.item.id))
  const picked = roundRobin(fresh, size)
  if (picked.length < size) {
    const recent = ranked.filter((s) => avoid.has(s.item.id))
    picked.push(...roundRobin(recent, size - picked.length))
  }
  return interleave(picked, rng)
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
