import { describe, expect, it } from 'vitest'
import { gradeYesAnd, vibeSeconds, xpFor } from './scoring'

describe('scoring', () => {
  it('adds a speed bonus only to timed best answers', () => {
    expect(xpFor('best')).toBe(10)
    expect(xpFor('best', 1)).toBe(15)
    expect(xpFor('best', 0)).toBe(10)
    expect(xpFor('okay', 1)).toBe(4)
    expect(xpFor('miss', 1)).toBe(0)
  })

  it('tightens the vibe clock as accuracy rises', () => {
    expect(vibeSeconds([], false)).toBe(7)
    expect(vibeSeconds([true, true, true, false, false], false)).toBe(5)
    expect(vibeSeconds(Array(10).fill(true), false)).toBe(3.5)
    expect(vibeSeconds(Array(10).fill(true), true)).toBe(7)
  })

  it('grades yes-and rounds by share sorted correctly', () => {
    expect(gradeYesAnd(3, 3)).toBe('best')
    expect(gradeYesAnd(2, 3)).toBe('okay')
    expect(gradeYesAnd(1, 3)).toBe('miss')
  })
})
