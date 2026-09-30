import { z } from 'zod'

/**
 * Content schema for every deck. The JSON files in ./decks are validated
 * against these by the test suite, which runs before every build, so
 * malformed content fails loudly instead of rendering a broken drill.
 * Kept out of the app bundle: the app imports only the inferred types.
 */

export const grade = z.enum(['best', 'okay', 'miss'])
export type Grade = z.infer<typeof grade>

const text = z.string().trim().min(1)

/** Exactly one option in a list may be graded "best". */
const oneBest = (options: { grade: Grade }[]) =>
  options.filter((o) => o.grade === 'best').length === 1

export const vibeItem = z.object({
  id: text,
  setting: text,
  scenario: text,
  options: z
    .array(z.object({ text, grade, tone: text }))
    .length(3)
    .refine(oneBest, 'exactly one option must be "best"'),
  pattern: text,
  why: text,
})

export const yesAndItem = z.object({
  id: text,
  prompt: text,
  context: text.optional(),
  cards: z
    .array(z.object({ text, keepsGoing: z.boolean(), why: text }))
    .min(2)
    .max(4)
    .refine((cards) => cards.some((c) => c.keepsGoing), 'needs at least one "Yes, And" card')
    .refine((cards) => cards.some((c) => !c.keepsGoing), 'needs at least one killer card'),
  pattern: text,
})

const sameTiles = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join('\u0000') === [...b].sort().join('\u0000')

export const upgraderItem = z
  .object({
    id: text,
    clunky: text,
    context: text.optional(),
    /** Chunks of the upgraded sentence, in canonical order. */
    tiles: z.array(text).min(3).max(8),
    /** Filler tiles the learner should leave in the tray. */
    distractors: z.array(text).min(1).max(4),
    /** Accepted orderings. Each is a permutation of `tiles`. The first is shown as the model answer. */
    answers: z.array(z.array(text)).min(1),
    why: text,
  })
  .refine((item) => item.answers.every((a) => sameTiles(a, item.tiles)), {
    message: 'every answer must use exactly the tiles, no more and no fewer',
  })
  .refine((item) => item.answers[0].join(' ') === item.tiles.join(' '), {
    message: 'the first answer must be the tiles in canonical order',
  })
  .refine((item) => !item.distractors.some((d) => item.tiles.includes(d)), {
    message: 'a distractor cannot also be a tile',
  })

export const dropInItem = z.object({
  id: text,
  fact: text,
  /** Where the fact can be checked. Required — no unsourced facts ship. */
  source: text,
  prompt: text,
  options: z
    .array(z.object({ text, grade, why: text }))
    .length(3)
    .refine(oneBest, 'exactly one option must be "best"'),
  pattern: text,
})

export const deck = z.object({
  id: text,
  title: text,
  tagline: text,
  description: text,
  vibe: z.array(vibeItem).min(1),
  yesAnd: z.array(yesAndItem).min(1),
  upgrader: z.array(upgraderItem).min(1),
  dropIn: z.array(dropInItem).min(1),
})

export type VibeItem = z.infer<typeof vibeItem>
export type YesAndItem = z.infer<typeof yesAndItem>
export type UpgraderItem = z.infer<typeof upgraderItem>
export type DropInItem = z.infer<typeof dropInItem>
export type Deck = z.infer<typeof deck>
