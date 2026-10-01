import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { SessionItem } from '../data/schema'
import { drillInfo } from '../data/schema'
import type { Result } from '../lib/srs'
import { useProgress } from '../store/progress'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from '../components/Button'
import { GradeBadge, PatternChip } from '../components/GradeBadge'
import { FlagIcon, XIcon } from '../components/icons'
import { VibeDrill } from '../drills/VibeDrill'
import { YesAndDrill } from '../drills/YesAndDrill'
import { UpgraderDrill } from '../drills/UpgraderDrill'
import { DropInDrill } from '../drills/DropInDrill'
import { WordPowerDrill } from '../drills/WordPowerDrill'

interface Played {
  entry: SessionItem
  result: Result
  xp: number
}

export function Session({
  build,
  exitTo,
  title,
}: {
  build: () => SessionItem[]
  exitTo: string
  title: string
}) {
  const [items, setItems] = useState(build)
  const [index, setIndex] = useState(0)
  const [played, setPlayed] = useState<Played[]>([])
  const answer = useProgress((s) => s.answer)
  const completeSession = useProgress((s) => s.completeSession)
  const navigate = useNavigate()

  const finished = items.length > 0 && index >= items.length
  const entry = items[index] as SessionItem | undefined

  useEffect(() => {
    if (finished) completeSession()
  }, [finished, completeSession])

  const onResult = useCallback(
    (result: Result, xp: number) => {
      if (!entry) return
      answer(entry.item.id, result, xp, { vibe: entry.kind === 'vibe' })
      setPlayed((p) => [...p, { entry, result, xp }])
    },
    [entry, answer],
  )
  const onNext = useCallback(() => setIndex((i) => i + 1), [])

  function again() {
    setItems(build())
    setIndex(0)
    setPlayed([])
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-2xl">Nothing here right now.</p>
        <p className="text-muted">Play a deck and anything you miss will come back here for review.</p>
        <Button onClick={() => navigate(exitTo)}>Back</Button>
      </div>
    )
  }

  if (finished) {
    return <Results played={played} onAgain={again} exitTo={exitTo} />
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link to={exitTo} aria-label="Leave session" className="rounded-full p-2 text-muted hover:bg-sunken hover:text-ink">
          <XIcon />
        </Link>
        <ProgressBar value={index / items.length} label={`Question ${index + 1} of ${items.length}`} />
        <span className="shrink-0 text-sm font-semibold tabular-nums text-muted">
          {index + 1}/{items.length}
        </span>
        <FlagButton entry={entry!} />
      </div>
      <p className="text-[13px] font-extrabold uppercase tracking-wider text-marigold-ink">
        {drillInfo[entry!.kind].name} <span className="text-muted">· {title}</span>
      </p>
      <Drill key={`${index}-${entry!.item.id}`} entry={entry!} onResult={onResult} onNext={onNext} />
    </div>
  )
}

/** Lets the learner mark a question that sounds unnatural, so it can be rewritten later. */
function FlagButton({ entry }: { entry: SessionItem }) {
  const flagged = useProgress((s) => s.flagged.some((f) => f.id === entry.item.id))
  const toggleFlag = useProgress((s) => s.toggleFlag)
  return (
    <button
      type="button"
      onClick={() => toggleFlag({ id: entry.item.id, text: summary(entry) })}
      aria-pressed={flagged}
      aria-label={flagged ? 'Flagged as sounding weird. Tap to unflag' : 'Sounds weird? Flag this question'}
      title="Sounds weird"
      className={`flex shrink-0 items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-extrabold ${
        flagged ? 'border-bad bg-bad-soft text-bad' : 'border-line text-muted hover:text-ink'
      }`}
    >
      <FlagIcon className="size-4" filled={flagged} />
      {flagged ? 'Flagged' : 'Weird?'}
    </button>
  )
}

function Drill({
  entry,
  onResult,
  onNext,
}: {
  entry: SessionItem
  onResult: (r: Result, xp: number) => void
  onNext: () => void
}) {
  switch (entry.kind) {
    case 'vibe':
      return <VibeDrill item={entry.item} onResult={onResult} onNext={onNext} />
    case 'yesAnd':
      return <YesAndDrill item={entry.item} onResult={onResult} onNext={onNext} />
    case 'upgrader':
      return <UpgraderDrill item={entry.item} onResult={onResult} onNext={onNext} />
    case 'dropIn':
      return <DropInDrill item={entry.item} onResult={onResult} onNext={onNext} />
    case 'wordPower':
      return <WordPowerDrill item={entry.item} onResult={onResult} onNext={onNext} />
  }
}

function Results({ played, onAgain, exitTo }: { played: Played[]; onAgain: () => void; exitTo: string }) {
  const best = played.filter((p) => p.result === 'best').length
  const xp = played.reduce((sum, p) => sum + p.xp, 0)
  const patterns = [...new Set(played.flatMap((p) => ('pattern' in p.entry.item ? [p.entry.item.pattern] : [])))]
  const missed = played.filter((p) => p.result !== 'best').length

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border-b-4 border-[#3d1fa3] bg-[#5b2ee6] p-6 text-center text-white">
        <p className="text-[13px] font-extrabold uppercase tracking-wider opacity-90">Session complete</p>
        <p className="mt-2 font-display text-5xl font-black">
          {best}/{played.length}
        </p>
        <p className="mt-1 opacity-80">best answers · +{xp} XP</p>
      </div>

      {missed > 0 && (
        <p className="rounded-2xl bg-meh-soft p-4 text-sm text-meh">
          {missed} {missed === 1 ? 'item goes' : 'items go'} into your review pile. They'll come back until they stick.
        </p>
      )}

      {patterns.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-black">Patterns you practised</h2>
          <div className="flex flex-wrap gap-2">
            {patterns.map((p) => (
              <PatternChip key={p} pattern={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-black">Round-up</h2>
        <ul className="flex flex-col divide-y divide-line rounded-2xl bg-surface">
          {played.map((p, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1 truncate">
                <span className="text-muted">{drillInfo[p.entry.kind].short} · </span>
                {summary(p.entry)}
              </span>
              <GradeBadge grade={p.result} />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to={exitTo}
          className="press inline-flex min-h-13 items-center justify-center rounded-2xl border-2 border-line border-b-edge bg-surface px-5 text-[17px] font-extrabold hover:bg-sunken"
        >
          Done
        </Link>
        <Button onClick={onAgain}>Another round</Button>
      </div>
    </div>
  )
}

function summary(e: SessionItem): string {
  switch (e.kind) {
    case 'vibe':
      return e.item.scenario
    case 'yesAnd':
      return e.item.prompt
    case 'upgrader':
      return e.item.clunky
    case 'dropIn':
      return e.item.fact
    case 'wordPower':
      return e.item.sentence
  }
}
