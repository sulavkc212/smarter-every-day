import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { record, type ItemProgress, type Result } from '../lib/srs'
import { daysBetween, today } from '../lib/dates'

export const LINE_XP = 15
const RECENT_VIBE = 10

interface State {
  progress: Record<string, ItemProgress>
  xp: number
  streak: { count: number; lastDay: string | null }
  /** Last few Choose the Vibe outcomes, newest last. Drives the adaptive timer. */
  recentVibe: boolean[]
  relaxedTimer: boolean
  /** Day the learner last said they used the line of the day in real life. */
  lineUsedOn: string | null
  /** Lines the learner starred, newest first. A personal phrasebook. */
  saved: SavedLine[]
  /** Deck the learner last played, for "Continue". */
  lastDeckId: string | null

  answer: (id: string, result: Result, xp: number, opts?: { vibe?: boolean }) => void
  completeSession: () => void
  markLineUsed: () => void
  setRelaxedTimer: (on: boolean) => void
  toggleSaved: (line: SavedLine) => void
  setLastDeck: (id: string) => void
  reset: () => void
}

export interface SavedLine {
  text: string
  pattern?: string
}

const initial = {
  progress: {},
  xp: 0,
  streak: { count: 0, lastDay: null },
  recentVibe: [],
  relaxedTimer: false,
  lineUsedOn: null,
  saved: [] as SavedLine[],
  lastDeckId: null as string | null,
}

export const useProgress = create<State>()(
  persist(
    (set) => ({
      ...initial,

      answer: (id, result, xp, opts) =>
        set((s) => ({
          progress: { ...s.progress, [id]: record(s.progress[id], result, today()) },
          xp: s.xp + xp,
          recentVibe: opts?.vibe
            ? [...s.recentVibe, result === 'best'].slice(-RECENT_VIBE)
            : s.recentVibe,
        })),

      completeSession: () =>
        set((s) => {
          const day = today()
          const { lastDay, count } = s.streak
          if (lastDay === day) return {}
          const next = lastDay && daysBetween(lastDay, day) === 1 ? count + 1 : 1
          return { streak: { count: next, lastDay: day } }
        }),

      markLineUsed: () =>
        set((s) => (s.lineUsedOn === today() ? {} : { lineUsedOn: today(), xp: s.xp + LINE_XP })),

      setRelaxedTimer: (on) => set({ relaxedTimer: on }),

      toggleSaved: (line) =>
        set((s) =>
          s.saved.some((l) => l.text === line.text)
            ? { saved: s.saved.filter((l) => l.text !== line.text) }
            : { saved: [line, ...s.saved] },
        ),

      setLastDeck: (id) => set({ lastDeckId: id }),

      reset: () => set(initial),
    }),
    { name: 'smarter-everyday', version: 1 },
  ),
)

/** Streak as displayed: it lapses if the last active day was before yesterday. */
export function currentStreak(streak: State['streak'], on = today()): number {
  if (!streak.lastDay) return 0
  return daysBetween(streak.lastDay, on) <= 1 ? streak.count : 0
}
