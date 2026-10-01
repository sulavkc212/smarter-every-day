import { useState } from 'react'
import { allItems, decks, deckItems } from '../data'
import { sections } from '../data/schema'
import { mastery } from '../lib/session'
import { isMastered } from '../lib/srs'
import { currentStreak, useProgress } from '../store/progress'
import { Button } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'

export function Me() {
  const progress = useProgress((s) => s.progress)
  const xp = useProgress((s) => s.xp)
  const streak = currentStreak(useProgress((s) => s.streak))
  const saved = useProgress((s) => s.saved.length)
  const relaxed = useProgress((s) => s.relaxedTimer)
  const setRelaxed = useProgress((s) => s.setRelaxedTimer)
  const reset = useProgress((s) => s.reset)
  const [confirming, setConfirming] = useState(false)

  const masteredItems = allItems.filter((s) => isMastered(progress[s.item.id]))
  const patterns = new Set(masteredItems.flatMap((s) => ('pattern' in s.item ? [s.item.pattern] : [])))

  const stats = [
    { label: 'XP', value: xp },
    { label: 'Day streak', value: streak },
    { label: 'Items mastered', value: masteredItems.length },
    { label: 'Patterns learned', value: patterns.size },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="pt-1">
        <h1 className="font-display text-3xl font-black">Me</h1>
        <p className="mt-1 text-muted">
          {saved} saved {saved === 1 ? 'line' : 'lines'}. Progress is stored on this device.
        </p>
      </section>

      <dl className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface p-4">
            <dt className="text-[13px] font-extrabold uppercase tracking-wider text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-black tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-black">Mastery by section</h2>
        <ul className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
          {sections.map((s) => {
            const items = decks.filter((d) => d.section === s.id).flatMap((d) => deckItems(d))
            if (items.length === 0) return null
            const m = mastery(items, progress)
            return (
              <li key={s.id} className="flex flex-col gap-1.5">
                <span className="flex justify-between text-sm">
                  <span className="font-extrabold">{s.title}</span>
                  <span className="tabular-nums text-muted">{Math.round(m * 100)}%</span>
                </span>
                <ProgressBar value={m} label={`${s.title} mastery`} color={s.color} />
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-black">Settings</h2>
        <label htmlFor="relaxed" className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-surface p-4">
          <span>
            <span className="block font-semibold">Relaxed timer</span>
            <span className="block text-sm text-muted">
              Doubles the clock in Choose the Vibe. Useful while you're learning the patterns.
            </span>
          </span>
          <input
            id="relaxed"
            type="checkbox"
            checked={relaxed}
            onChange={(e) => setRelaxed(e.target.checked)}
            className="mt-1 size-6 shrink-0 accent-[var(--lake)]"
          />
        </label>

        {confirming ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-bad bg-bad-soft p-4">
            <p className="text-sm font-semibold text-bad">Erase all progress, XP, saved lines and your streak on this device?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
              <Button
                className="bg-bad! text-surface!"
                onClick={() => {
                  reset()
                  setConfirming(false)
                }}
              >
                Erase
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="text-bad!" onClick={() => setConfirming(true)}>
            Reset all progress
          </Button>
        )}
      </section>
    </div>
  )
}
