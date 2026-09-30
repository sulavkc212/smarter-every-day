import type { Result } from './srs'

export const XP = { best: 10, okay: 4, miss: 0 } as const
export const MAX_SPEED_BONUS = 5

/** XP for one answer. `timeLeft` (0–1) adds a speed bonus on a timed "best" answer. */
export function xpFor(result: Result, timeLeft?: number): number {
  const base = XP[result]
  if (result !== 'best' || timeLeft === undefined) return base
  return base + Math.round(MAX_SPEED_BONUS * Math.min(Math.max(timeLeft, 0), 1))
}

/**
 * Seconds on the Choose the Vibe clock, adapted to recent accuracy so the
 * pressure rises as instinct improves. `recent` holds the last few vibe results.
 */
export function vibeSeconds(recent: boolean[], relaxed: boolean): number {
  let seconds = 7
  if (recent.length >= 5) {
    const rate = recent.filter(Boolean).length / recent.length
    if (rate >= 0.85) seconds = 3.5
    else if (rate >= 0.6) seconds = 5
  }
  return relaxed ? seconds * 2 : seconds
}

/** A Yes, And round has several cards; grade the round by how many were sorted right. */
export function gradeYesAnd(correct: number, total: number): Result {
  if (correct === total) return 'best'
  if (correct / total >= 0.5) return 'okay'
  return 'miss'
}
