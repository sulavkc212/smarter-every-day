import { useState } from 'react'
import type { WordPowerItem } from '../data/schema'
import type { DrillProps } from './types'
import { Feedback } from './Feedback'
import { GradeBadge } from '../components/GradeBadge'
import { shuffle } from '../lib/random'
import { xpFor } from '../lib/scoring'
import { useHotkeys } from '../lib/useHotkeys'

/** Render `sentence` with `target` (or its replacement) highlighted. */
function Highlighted({ sentence, target, replacement }: { sentence: string; target: string; replacement?: string }) {
  const at = sentence.indexOf(target)
  const before = sentence.slice(0, at)
  const after = sentence.slice(at + target.length)
  return (
    <>
      {before}
      <mark
        className={`rounded-md px-1 ${replacement ? 'bg-good-soft text-good' : 'bg-marigold text-lake'}`}
      >
        {replacement ?? target}
      </mark>
      {after}
    </>
  )
}

export function WordPowerDrill({ item, onResult, onNext }: DrillProps<WordPowerItem>) {
  const [options] = useState(() => shuffle(item.options))
  const [picked, setPicked] = useState<number | null>(null)
  const [xp, setXp] = useState(0)
  const done = picked !== null
  const best = item.options.find((o) => o.grade === 'best')!.text

  function choose(i: number) {
    if (done) return
    const grade = options[i].grade
    const gained = xpFor(grade)
    setPicked(i)
    setXp(gained)
    onResult(grade, gained)
  }

  useHotkeys({ '1': () => choose(0), '2': () => choose(1), '3': () => choose(2) }, !done)

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-lake p-5 text-on-lake">
        <p className="text-xs font-bold uppercase tracking-widest opacity-75">Swap the tired word</p>
        <p className="mt-2 font-display text-xl leading-snug">
          “<Highlighted sentence={item.sentence} target={item.target} />”
        </p>
      </div>
      <p className="text-sm text-muted">Pick the word that lands best, and that anyone could understand.</p>
      <ol className="flex flex-col gap-3">
        {options.map((o, i) => {
          const mine = picked === i
          const ring = done
            ? o.grade === 'best'
              ? 'border-good bg-good-soft'
              : mine
                ? 'border-bad bg-bad-soft'
                : 'border-line bg-surface opacity-80'
            : 'border-line bg-surface hover:border-lake'
          return (
            <li key={o.text}>
              <button
                type="button"
                disabled={done}
                onClick={() => choose(i)}
                className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${ring}`}
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-bold text-muted">
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-semibold">{o.text}</span>
                  {done && (
                    <span className="mt-1 block text-sm text-muted">
                      <GradeBadge grade={o.grade} /> {o.why}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      {done && (
        <Feedback
          result={options[picked].grade}
          xp={xp}
          save={{ text: item.sentence.replace(item.target, best) }}
          onNext={onNext}
        >
          <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
            <p className="font-display text-lg leading-snug">
              “<Highlighted sentence={item.sentence} target={item.target} replacement={best} />”
            </p>
            <p className="text-sm">
              <strong>{best}</strong>: {item.meaning}
            </p>
            <p className="text-sm text-muted">Also: “{item.example}”</p>
          </div>
        </Feedback>
      )}
    </div>
  )
}
