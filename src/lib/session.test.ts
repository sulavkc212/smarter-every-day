import { describe, expect, it } from 'vitest'
import { decks, deckItems } from '../data'
import type { Deck } from '../data/schema'
import { buildSession, mastery, nextUpDeck, reviewPool, unlockedDeckIds } from './session'
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

  it('never puts the same drill kind twice in a row in a mixed round', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const s = buildSession(deckItems(decks[0]), {}, day, 10, seeded(seed))
      for (let i = 1; i < s.length; i++) expect(s[i].kind, `seed ${seed}`).not.toBe(s[i - 1].kind)
      expect(new Set(s.map((x) => x.kind)).size, `seed ${seed}`).toBe(5)
    }
  })

  it('"another round" avoids the questions just played, even the missed ones', () => {
    const pool = deckItems(decks[0])
    const progress: Record<string, ItemProgress> = {}
    const first = buildSession(pool, progress, day, 10, seeded(3))
    for (const s of first) progress[s.item.id] = record(undefined, 'miss', day)
    const recent = new Set(first.map((s) => s.item.id))
    const second = buildSession(pool, progress, day, 10, seeded(4), recent)
    expect(second.filter((s) => recent.has(s.item.id))).toEqual([])
  })

  it('falls back to recent questions only when the pool is too small', () => {
    const pool = deckItems(decks[0], 'vibe').slice(0, 4)
    const recent = new Set(pool.slice(0, 2).map((s) => s.item.id))
    const s = buildSession(pool, {}, day, 4, seeded(5), recent)
    expect(s).toHaveLength(4)
  })

  it('review rounds still include items just missed', () => {
    const pool = deckItems(decks[0])
    const missed = pool[3].item.id
    const progress = { [missed]: record(undefined, 'miss', day) }
    const review = buildSession(reviewPool(decks, progress, day), progress, day)
    expect(review.map((s) => s.item.id)).toEqual([missed])
  })

  it('opens the first deck of each section and unlocks within a section at 60%', () => {
    const vibe = (id: string) => ({
      id,
      setting: 's',
      scenario: 's',
      pattern: 'p',
      why: 'w',
      options: [
        { text: 'a', grade: 'best' as const, tone: 't' },
        { text: 'b', grade: 'okay' as const, tone: 't' },
        { text: 'c', grade: 'miss' as const, tone: 't' },
      ],
    })
    const make = (id: string, section: Deck['section']): Deck => ({
      id,
      section,
      icon: 'cup',
      title: id,
      tagline: '',
      description: '',
      vibe: Array.from({ length: 10 }, (_, i) => vibe(`${id}-${i}`)),
      yesAnd: [],
      upgrader: [],
      dropIn: [],
      wordPower: [],
    })
    const ds = [make('a1', 'everyday'), make('a2', 'everyday'), make('a3', 'everyday'), make('b1', 'craft'), make('b2', 'craft')]
    const progress: Record<string, ItemProgress> = {}
    expect([...unlockedDeckIds(ds, progress)]).toEqual(['a1', 'b1'])

    for (const s of deckItems(ds[0]).slice(0, 6)) progress[s.item.id] = { box: 2, lastSeen: day, seen: 2, best: 2 }
    expect(mastery(deckItems(ds[0]), progress)).toBe(0.6)
    expect([...unlockedDeckIds(ds, progress)]).toEqual(['a1', 'a2', 'b1'])
    expect(nextUpDeck(ds, progress)?.id).toBe('a2')
  })

  it('review pool only holds items that are due', () => {
    const id = deckItems(decks[0])[0].item.id
    const pool = reviewPool(decks, { [id]: record(undefined, 'miss', day) }, day)
    expect(pool.map((s) => s.item.id)).toEqual([id])
  })
})
