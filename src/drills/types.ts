import type { Result } from '../lib/srs'

export interface DrillProps<T> {
  item: T
  /** Called exactly once, when the answer is graded. */
  onResult: (result: Result, xp: number) => void
  /** Called when the learner is ready for the next item. */
  onNext: () => void
}
