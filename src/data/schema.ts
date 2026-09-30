import type { DropInItem, UpgraderItem, VibeItem, YesAndItem } from './validate'

// Types are inferred from the Zod schemas in ./validate. Type-only imports keep Zod out of the app bundle.
export type { Deck, DropInItem, Grade, UpgraderItem, VibeItem, YesAndItem } from './validate'

export const drillKinds = ['vibe', 'yesAnd', 'upgrader', 'dropIn'] as const
export type DrillKind = (typeof drillKinds)[number]

/** One playable unit in a session, tagged with its drill and deck. */
export type SessionItem =
  | { kind: 'vibe'; deckId: string; item: VibeItem }
  | { kind: 'yesAnd'; deckId: string; item: YesAndItem }
  | { kind: 'upgrader'; deckId: string; item: UpgraderItem }
  | { kind: 'dropIn'; deckId: string; item: DropInItem }

export const drillInfo: Record<DrillKind, { name: string; short: string; blurb: string }> = {
  vibe: {
    name: 'Choose the Vibe',
    short: 'Vibe',
    blurb: 'A scene, three replies, a ticking clock. Trust your gut.',
  },
  yesAnd: {
    name: 'Yes, And…',
    short: 'Yes, And',
    blurb: 'Swipe right on replies that keep the volley going, left on the killers.',
  },
  upgrader: {
    name: 'Sentence Upgrader',
    short: 'Upgrader',
    blurb: 'Rebuild a clunky thought into one clean line. Leave the filler behind.',
  },
  dropIn: {
    name: 'Knowledge Drop-In',
    short: 'Drop-In',
    blurb: 'Learn a fact, then slip it into conversation like it was nothing.',
  },
}
