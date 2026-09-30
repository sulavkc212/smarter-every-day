# Smarter Everyday

Daily drills for conversational agility: quick wit, warm cheek, clean sentences, and slipping knowledge into a chat without sounding like a textbook. Written for a Nepal-based host or guide talking with visitors from everywhere.

A frontend-only React app. All content lives in JSON; there is no backend. Progress is saved in the browser.

## The drills

| Drill | Trains | Mechanic |
| --- | --- | --- |
| **Choose the Vibe** | Instinct and timing | A scene, then three replies against a clock. The clock adapts: 7s → 5s → 3.5s as accuracy rises. The scene shows for 1.5s before the clock starts. |
| **Yes, And…** | Never killing a conversation | Swipe cards right if they keep the volley going, left if they shut it down. Drag, buttons or ← / → keys. |
| **Sentence Upgrader** | Structure and cutting filler | Rebuild a clunky thought from tiles. Tap to place, drag to reorder. Filler tiles ("like", "um") are traps. |
| **Knowledge Drop-In** | Using facts socially | A sourced fact card, then pick the line that uses it like a person would. |

Every answer is graded **best / okay / miss** and comes with a named *pattern* ("Playful threat", "Read the room", "Correct with a story") and a one-line *why*. The point is to learn the pattern, not memorise the answer.

## Decks

1. **Lakeside Cafe Casual**: small talk, ordering, weather, compliments
2. **Cheeky & Flirty**: warm teasing, plus "read the room" items where not flirting is the right call
3. **The Articulate Leader**: briefings, instructions to staff, complaints, disagreement
4. **The International Traveler**: cross-cultural chat, good questions, geography and history

Each deck has 10 items per drill (160 in total). A deck unlocks at 70% mastery of the one before it.

## Progress

- **Spaced repetition**: Leitner boxes 1–5. A miss goes back to box 1 and is due again today. Each best answer moves the item up a box, and higher boxes wait longer (0, 1, 3, 7, 14 days). An item counts as mastered from box 2.
- **XP**: best 10 (+ up to 5 speed bonus in Vibe), okay 4. **Streak** counts days with a finished session.
- **Line of the day**: one strong line from your unlocked decks to try in real life. Tapping "I used it" gives +15 XP.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · motion (swipes and animation) · dnd-kit (tile reordering) · Zustand (persisted progress) · React Router (hash routing, so any static host works) · vite-plugin-pwa (installable, works offline) · Zod (content validation, test time only) · Vitest · Playwright.

## Commands

```bash
npm install
npm run dev        # dev server
npm test           # unit tests, including content validation
npm run lint
npm run build      # validates all deck JSON, typechecks, builds to dist/
npm run e2e        # Playwright: every drill at phone and desktop sizes
```

The build output in `dist/` is static. Deploy it to Netlify, Vercel, Cloudflare Pages or GitHub Pages as-is.

## Writing content

Decks live in `src/data/decks/*.json`. The schema is in `src/data/validate.ts`, and `npm run build` refuses to build if any deck is invalid. The rules it checks:

- Vibe and Drop-In items have exactly 3 options with exactly one `best`.
- Yes, And items have 2–4 cards, with at least one of each kind.
- Upgrader `answers` are permutations of `tiles`; the first is the canonical order. Distractors can't also be tiles.
- Drop-In facts need a `source`. Don't add a fact you can't point to.
- Item ids are unique across all decks.

Tone: warm and specific, never mean. Wrong options should be tempting, not strawmen. The best option shouldn't always be the longest one.
