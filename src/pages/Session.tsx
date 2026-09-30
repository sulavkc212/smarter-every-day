import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { SessionItem } from '../data/schema'
import { drillInfo } from '../data/schema'
import type { Result } from '../lib/srs'
import { useProgress } from '../store/progress'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from '../components/Button'
import { GradeBadge, PatternChip } from '../components/GradeBadge'
import { XIcon } from '../components/icons'
import { VibeDrill } from '../drills/VibeDrill'
import { YesAndDrill } from '../drills/YesAndDrill'
import { UpgraderDrill } from '../drills/UpgraderDrill'
import { DropInDrill } from '../drills/DropInDrill'

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
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-marigold-ink">
        {drillInfo[entry!.kind].name} <span className="text-muted">· {title}</span>
      </p>
      <Drill key={`${index}-${entry!.item.id}`} entry={entry!} onResult={onResult} onNext={onNext} />
    </div>
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
  }
}

function Results({ played, onAgain, exitTo }: { played: Played[]; onAgain: () => void; exitTo: string }) {
  const best = played.filter((p) => p.result === 'best').length
  const xp = played.reduce((sum, p) => sum + p.xp, 0)
  const patterns = [...new Set(played.flatMap((p) => ('pattern' in p.entry.item ? [p.entry.item.pattern] : [])))]
  const missed = played.filter((p) => p.result !== 'best').length

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-lake p-6 text-center text-on-lake">
        <p className="text-xs font-bold uppercase tracking-widest opacity-75">Session complete</p>
        <p className="mt-2 font-display text-5xl font-bold">
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
          <h2 className="mb-3 font-display text-lg font-bold">Patterns you practised</h2>
          <div className="flex flex-wrap gap-2">
            {patterns.map((p) => (
              <PatternChip key={p} pattern={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Round-up</h2>
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
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-line bg-surface px-5 font-semibold hover:bg-sunken"
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
  }
}
