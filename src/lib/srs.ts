import { daysBetween } from './dates'

/**
 * Leitner-box spaced repetition.
 * Box 0 = never seen. A miss sends an item back to box 1 (due again today);
 * each "best" answer moves it up one box, and higher boxes wait longer.
 */
export type Result = 'best' | 'okay' | 'miss'

export interface ItemProgress {
  box: number
  lastSeen: string
  seen: number
  best: number
}

export const MAX_BOX = 5
/** Days to wait before an item in box N is due again. */
export const INTERVALS = [0, 0, 1, 3, 7, 14] as const
/** An item in this box or higher counts as mastered. */
export const MASTERED_BOX = 2

export function nextBox(box: number, result: Result): number {
  if (result === 'best') return Math.min(box + 1, MAX_BOX)
  if (result === 'okay') return Math.max(box, 1)
  return 1
}

export function isDue(p: ItemProgress | undefined, on: string): boolean {
  if (!p || p.box === 0) return false
  return daysBetween(p.lastSeen, on) >= INTERVALS[p.box]
}

export function isMastered(p: ItemProgress | undefined): boolean {
  return !!p && p.box >= MASTERED_BOX
}

export function record(p: ItemProgress | undefined, result: Result, on: string): ItemProgress {
  const prev = p ?? { box: 0, lastSeen: on, seen: 0, best: 0 }
  return {
    box: nextBox(prev.box, result),
    lastSeen: on,
    seen: prev.seen + 1,
    best: prev.best + (result === 'best' ? 1 : 0),
  }
}
