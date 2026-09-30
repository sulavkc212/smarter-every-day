import { describe, expect, it } from 'vitest'
import { decks, deckItems } from '../data'
import { buildSession, mastery, reviewPool, unlockedDeckIds } from './session'
import { record, type ItemProgress } from './srs'
import { seeded } from './random'

const day = '2026-09-10'

describe('session builder', () => {
  it('returns a mixed set of the requested size with no duplicates', () => {
    const s = buildSession(deckItems(decks[0]), {}, day, 10, seeded(1))
    expect(s).toHaveLength(10)
    expect(new Set(s.map((x) => x.item.id)).size).toBe(10)
    expect(new Set(s.map((x) => x.kind)).size).toBeGreaterThan(1)
  })

  it('puts due items ahead of mastered ones', () => {
    const pool = deckItems(decks[0])
    const progress: Record<string, ItemProgress> = {}
    for (const s of pool) progress[s.item.id] = { box: 4, lastSeen: day, seen: 3, best: 3 }
    const missed = pool[7].item.id
    progress[missed] = record(progress[missed], 'miss', day)
    expect(buildSession(pool, progress, day, 3, seeded(2)).map((s) => s.item.id)).toContain(missed)
  })

  it('unlocks the next deck at 70% mastery', () => {
    const progress: Record<string, ItemProgress> = {}
    expect([...unlockedDeckIds(decks, progress)]).toEqual(['lakeside-cafe'])
    const first = deckItems(decks[0])
    const needed = Math.ceil(first.length * 0.7)
    for (const s of first.slice(0, needed)) progress[s.item.id] = { box: 2, lastSeen: day, seen: 2, best: 2 }
    expect(mastery(first, progress)).toBeGreaterThanOrEqual(0.7)
    expect([...unlockedDeckIds(decks, progress)]).toEqual(['lakeside-cafe', 'cheeky-flirty'])
  })

  it('review pool only holds items that are due', () => {
    const id = deckItems(decks[0])[0].item.id
    const pool = reviewPool(decks, { [id]: record(undefined, 'miss', day) }, day)
    expect(pool.map((s) => s.item.id)).toEqual([id])
  })
})
