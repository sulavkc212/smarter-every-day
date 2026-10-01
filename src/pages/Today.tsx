import { useState } from 'react'
import { Link } from 'react-router'
import { decks, deckItems, getDeck } from '../data'
import { sectionColor, sections } from '../data/schema'
import { mastery, nextUpDeck, reviewPool, unlockedDeckIds } from '../lib/session'
import { lineOfDay } from '../lib/lineOfDay'
import { today } from '../lib/dates'
import { LINE_XP, currentStreak, useProgress } from '../store/progress'
import { Button } from '../components/Button'
import { PatternChip } from '../components/GradeBadge'
import { MasteryRing } from '../components/DeckIcon'
import { ArrowIcon, CheckIcon, PlayIcon } from '../components/icons'

function greeting(hour: number) {
  if (hour < 12) return 'Good morning.'
  if (hour < 17) return 'Namaste.'
  return 'Good evening.'
}

export function Today() {
  const progress = useProgress((s) => s.progress)
  const lineUsedOn = useProgress((s) => s.lineUsedOn)
  const markLineUsed = useProgress((s) => s.markLineUsed)
  const lastDeckId = useProgress((s) => s.lastDeckId)
  const streak = currentStreak(useProgress((s) => s.streak))
  const day = today()
  const [hello] = useState(() => greeting(new Date().getHours()))

  const unlocked = unlockedDeckIds(decks, progress)
  const open = decks.filter((d) => unlocked.has(d.id))
  const due = reviewPool(open, progress, day).length
  const line = lineOfDay(open, day)
  const usedToday = lineUsedOn === day
  const last = lastDeckId ? getDeck(lastDeckId) : undefined
  const continueDeck = last && unlocked.has(last.id) ? last : undefined
  const next = nextUpDeck(decks, progress)
  const suggestion = next && next.id !== continueDeck?.id ? next : undefined

  return (
    <div className="flex flex-col gap-5">
      <section className="pt-1">
        <h1 className="font-display text-3xl font-black leading-tight">{hello}</h1>
        <p className="mt-1 text-muted">
          {streak > 0
            ? `Day ${streak} of your streak. Keep it going with ten quick ones.`
            : 'Ten quick drills a day. Quicker, warmer, clearer by the week.'}
        </p>
      </section>

      <Link
        to="/play/daily"
        className="press group flex items-center justify-between gap-4 rounded-3xl border-[#3d1fa3] bg-gradient-to-br from-[#5b2ee6] to-[#7c3aed] p-5 text-white"
      >
        <span>
          <span className="block text-[13px] font-extrabold uppercase tracking-wider opacity-90">Daily 10</span>
          <span className="mt-1 block font-display text-2xl font-black">Start today's drills</span>
          <span className="mt-1 block text-sm font-bold opacity-90">
            {due > 0 ? `${due} review ${due === 1 ? 'item' : 'items'} first, then fresh ones` : 'A mix from all your open decks'}
          </span>
        </span>
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full border-b-4 border-[#d98c00] bg-[#ffb21e] text-[#14142b] transition group-hover:scale-105">
          <PlayIcon className="size-7 translate-x-0.5" />
        </span>
      </Link>

      {(continueDeck || suggestion) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {continueDeck && <DeckShortcut label="Continue" deckId={continueDeck.id} />}
          {suggestion && <DeckShortcut label="Next up" deckId={suggestion.id} />}
        </section>
      )}

      {line && (
        <section className="rounded-3xl border-2 border-b-4 border-marigold border-b-marigold-edge bg-surface p-5">
          <p className="text-[13px] font-extrabold uppercase tracking-wider text-marigold-ink">Line of the day</p>
          <p className="mt-2 font-display text-xl font-extrabold leading-snug">“{line.text}”</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PatternChip pattern={line.pattern} />
          </div>
          <p className="mt-3 text-sm text-muted">Use this pattern once in a real conversation today, in your own words.</p>
          <Button
            variant={usedToday ? 'secondary' : 'primary'}
            onClick={markLineUsed}
            disabled={usedToday}
            className="mt-4 w-full"
          >
            {usedToday ? (
              <>
                <CheckIcon /> Used it today
              </>
            ) : (
              `I used it (+${LINE_XP} XP)`
            )}
          </Button>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-black">Sections</h2>
          <Link to="/explore" className="text-sm font-extrabold text-lake hover:underline">
            See all decks
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sections.map((s) => {
            const inSection = decks.filter((d) => d.section === s.id)
            if (inSection.length === 0) return null
            const m = mastery(inSection.flatMap((d) => deckItems(d)), progress)
            return (
              <Link
                key={s.id}
                to={`/explore#${s.id}`}
                className="press flex flex-col gap-1 overflow-hidden rounded-2xl border-2 border-line border-b-edge bg-surface p-4 pt-3 hover:border-lake"
              >
                <span aria-hidden="true" className="mb-1 h-1.5 w-10 rounded-full" style={{ background: s.color }} />
                <span className="font-extrabold leading-tight">{s.title}</span>
                <span className="text-sm font-bold text-muted">
                  {inSection.length} {inSection.length === 1 ? 'deck' : 'decks'} · {Math.round(m * 100)}%
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function DeckShortcut({ label, deckId }: { label: string; deckId: string }) {
  const progress = useProgress((s) => s.progress)
  const d = getDeck(deckId)!
  const m = mastery(deckItems(d), progress)
  return (
    <Link
      to={`/deck/${d.id}`}
      className="flex items-center gap-3 press rounded-2xl border-2 border-line border-b-edge bg-surface p-3 hover:border-lake"
    >
      <MasteryRing value={m} icon={d.icon} color={sectionColor(d.section)} />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-extrabold uppercase tracking-wider text-muted">{label}</span>
        <span className="block truncate text-lg font-extrabold">{d.title}</span>
      </span>
      <ArrowIcon className="size-5 text-muted" />
    </Link>
  )
}
