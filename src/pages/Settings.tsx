import { Link } from 'react-router'
import { useProgress } from '../store/progress'
import { Button } from '../components/Button'
import { BackIcon } from '../components/icons'

export function Settings() {
  const relaxed = useProgress((s) => s.relaxedTimer)
  const setRelaxed = useProgress((s) => s.setRelaxedTimer)
  const reset = useProgress((s) => s.reset)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="-ml-2 flex w-fit items-center gap-1 rounded-full px-2 py-1 text-sm text-muted hover:text-ink">
        <BackIcon className="size-4" /> Home
      </Link>
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-surface p-4">
        <span>
          <span className="block font-semibold">Relaxed timer</span>
          <span className="block text-sm text-muted">
            Doubles the clock in Choose the Vibe. Useful while you're learning the patterns, or if you read more slowly.
          </span>
        </span>
        <input
          type="checkbox"
          checked={relaxed}
          onChange={(e) => setRelaxed(e.target.checked)}
          className="mt-1 size-6 shrink-0 accent-[var(--lake)]"
        />
      </label>

      <section className="rounded-2xl bg-surface p-4">
        <h2 className="font-semibold">How it works</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
          <li>Each session mixes about ten items from a deck.</li>
          <li>Anything you miss returns in Review until it sticks. Items you get right come back less often.</li>
          <li>The Choose the Vibe clock gets shorter as your instincts get sharper.</li>
          <li>Progress is saved on this device only.</li>
        </ul>
      </section>

      <Button
        variant="secondary"
        className="text-bad!"
        onClick={() => {
          if (window.confirm('Erase all progress, XP and your streak on this device?')) reset()
        }}
      >
        Reset all progress
      </Button>
    </div>
  )
}
