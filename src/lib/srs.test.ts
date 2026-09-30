import { describe, expect, it } from 'vitest'
import { isDue, isMastered, nextBox, record } from './srs'

describe('srs', () => {
  it('moves up on best, holds on okay, resets on miss', () => {
    expect(nextBox(0, 'best')).toBe(1)
    expect(nextBox(4, 'best')).toBe(5)
    expect(nextBox(5, 'best')).toBe(5)
    expect(nextBox(0, 'okay')).toBe(1)
    expect(nextBox(3, 'okay')).toBe(3)
    expect(nextBox(4, 'miss')).toBe(1)
  })

  it('schedules by box', () => {
    const missed = record(undefined, 'miss', '2026-09-01')
    expect(isDue(missed, '2026-09-01')).toBe(true)

    const learned = record(record(undefined, 'best', '2026-09-01'), 'best', '2026-09-01')
    expect(learned.box).toBe(2)
    expect(isDue(learned, '2026-09-01')).toBe(false)
    expect(isDue(learned, '2026-09-02')).toBe(true)
    expect(isMastered(learned)).toBe(true)
  })

  it('never treats unseen items as due', () => {
    expect(isDue(undefined, '2026-09-01')).toBe(false)
  })
})
