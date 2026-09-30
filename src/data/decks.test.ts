import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { allItems, DECK_ORDER, decks, deckItems } from '.'
import { deck } from './validate'

describe('deck content', () => {
  it('loads every deck file, in the declared order', () => {
    const onDisk = readdirSync('src/data/decks').filter((f) => f.endsWith('.json'))
    expect(decks).toHaveLength(onDisk.length)
    for (const d of decks) expect(DECK_ORDER).toContain(d.id)
  })

  it.each(decks)('$id passes schema validation', (d) => {
    const parsed = deck.safeParse(d)
    expect(parsed.success, parsed.error?.message).toBe(true)
  })

  it('has unique item ids across every deck', () => {
    const ids = allItems.map((s) => s.item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not let "pick the longest option" win most rounds', () => {
    const graded = allItems.flatMap((s) =>
      s.kind === 'vibe' || s.kind === 'dropIn' || s.kind === 'wordPower' ? [s.item.options] : [],
    )
    const bestIsLongest = graded.filter((options) => {
      const longest = Math.max(...options.map((o) => o.text.length))
      return options.find((o) => o.grade === 'best')!.text.length === longest
    }).length
    expect(bestIsLongest / graded.length).toBeLessThanOrEqual(0.6)
  })

  it.each(decks)('$id: the best option is not usually the longest', (d) => {
    const graded = [...d.vibe, ...d.dropIn, ...d.wordPower].map((i) => i.options)
    if (graded.length < 10) return
    const bestIsLongest = graded.filter((options) => {
      const longest = Math.max(...options.map((o) => o.text.length))
      return options.find((o) => o.grade === 'best')!.text.length === longest
    }).length
    expect(bestIsLongest / graded.length).toBeLessThanOrEqual(0.65)
  })

  it('never repeats the same option text within an item', () => {
    for (const s of allItems) {
      const texts =
        s.kind === 'vibe' || s.kind === 'dropIn' || s.kind === 'wordPower'
          ? s.item.options.map((o) => o.text)
          : s.kind === 'yesAnd'
            ? s.item.cards.map((c) => c.text)
            : [...s.item.tiles, ...s.item.distractors]
      expect(new Set(texts).size, s.item.id).toBe(texts.length)
    }
  })

  it('gives every dated news item an expiry', () => {
    for (const s of allItems) {
      if (s.kind === 'dropIn' && s.item.date) expect(s.item.expires, s.item.id).toBeTruthy()
    }
  })

  it('hides items after their expiry day', () => {
    const withExpiry = allItems.find((s) => s.kind === 'dropIn' && s.item.expires)
    if (!withExpiry || withExpiry.kind !== 'dropIn') return
    const d = decks.find((x) => x.id === withExpiry.deckId)!
    const ids = (on: string) => deckItems(d, 'dropIn', on).map((s) => s.item.id)
    expect(ids(withExpiry.item.expires!)).toContain(withExpiry.item.id)
    expect(ids('2999-01-01')).not.toContain(withExpiry.item.id)
  })
})
