import type { DropInItem, SectionId, UpgraderItem, VibeItem, WordPowerItem, YesAndItem } from './validate'

// Types are inferred from the Zod schemas in ./validate. Type-only imports keep Zod out of the app bundle.
export type {
  Deck,
  DropInItem,
  Grade,
  SectionId,
  UpgraderItem,
  VibeItem,
  WordPowerItem,
  YesAndItem,
} from './validate'

export const drillKinds = ['vibe', 'yesAnd', 'upgrader', 'dropIn', 'wordPower'] as const
export type DrillKind = (typeof drillKinds)[number]

/** One playable unit in a session, tagged with its drill and deck. */
export type SessionItem =
  | { kind: 'vibe'; deckId: string; item: VibeItem }
  | { kind: 'yesAnd'; deckId: string; item: YesAndItem }
  | { kind: 'upgrader'; deckId: string; item: UpgraderItem }
  | { kind: 'dropIn'; deckId: string; item: DropInItem }
  | { kind: 'wordPower'; deckId: string; item: WordPowerItem }

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
  wordPower: {
    name: 'Word Power',
    short: 'Words',
    blurb: 'Swap a tired word for one that lands. Simple, vivid, easy for anyone to understand.',
  },
}

export const sections: { id: SectionId; title: string; blurb: string }[] = [
  { id: 'everyday', title: 'Everyday Talk', blurb: 'Cafes, streets, buses and the questions every traveller asks.' },
  { id: 'craft', title: 'Conversation Craft', blurb: 'Start a chat, keep it flowing, and be the person they remember.' },
  { id: 'charm', title: 'Charm & Wit', blurb: 'Teasing, banter and flirting, warmly and at the right moment.' },
  { id: 'culture', title: 'Culture Talk', blurb: 'Music, the world, and what everyone is talking about this season.' },
  { id: 'leadership', title: 'Leadership', blurb: 'Lead a group, give clear instructions, handle problems gracefully.' },
]
