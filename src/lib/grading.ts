import type { UpgraderItem } from '../data/schema'
import type { Result } from './srs'

/** Exact accepted order = best; right tiles with no filler but another order = okay; anything else = miss. */
export function gradeUpgrade(item: UpgraderItem, built: string[]): Result {
  if (item.answers.some((a) => a.length === built.length && a.every((t, i) => t === built[i]))) return 'best'
  const sameSet =
    built.length === item.tiles.length && [...built].sort().join('\u0000') === [...item.tiles].sort().join('\u0000')
  return sameSet ? 'okay' : 'miss'
}
