import { describe, expect, it } from 'vitest'
import { allItems, decks } from '.'
import { drillKinds } from './schema'
import { deck } from './validate'

describe('deck content', () => {
  it('loads four decks in unlock order', () => {
    expect(decks.map((d) => d.id)).toEqual([
      'lakeside-cafe',
      'cheeky-flirty',
      'articulate-leader',
      'international-traveler',
    ])
  })

  it.each(decks)('$id passes schema validation', (d) => {
    const parsed = deck.safeParse(d)
    expect(parsed.success, parsed.error?.message).toBe(true)
  })

  it('has unique item ids across every deck', () => {
    const ids = allItems.map((s) => s.item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(decks)('$id has at least 10 items per drill', (d) => {
    for (const kind of drillKinds) expect(d[kind].length).toBeGreaterThanOrEqual(10)
  })

  it('does not let "pick the longest option" win most rounds', () => {
    const graded = allItems.flatMap((s) => (s.kind === 'vibe' || s.kind === 'dropIn' ? [s.item.options] : []))
    const bestIsLongest = graded.filter((options) => {
      const longest = Math.max(...options.map((o) => o.text.length))
      return options.find((o) => o.grade === 'best')!.text.length === longest
    }).length
    expect(bestIsLongest / graded.length).toBeLessThanOrEqual(0.6)
  })

  it('never repeats the same option text within an item', () => {
    for (const s of allItems) {
      const texts =
        s.kind === 'vibe' || s.kind === 'dropIn'
          ? s.item.options.map((o) => o.text)
          : s.kind === 'yesAnd'
            ? s.item.cards.map((c) => c.text)
            : [...s.item.tiles, ...s.item.distractors]
      expect(new Set(texts).size, s.item.id).toBe(texts.length)
    }
  })
})
