import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { UpgraderItem } from '../data/schema'
import type { DrillProps } from './types'
import { Feedback } from './Feedback'
import { Button } from '../components/Button'
import { shuffle } from '../lib/random'
import { xpFor } from '../lib/scoring'
import type { Result } from '../lib/srs'
import { gradeUpgrade } from '../lib/grading'

interface Tile {
  id: string
  text: string
  filler: boolean
}

export function UpgraderDrill({ item, onResult, onNext }: DrillProps<UpgraderItem>) {
  const [tray, setTray] = useState<Tile[]>(() =>
    shuffle([
      ...item.tiles.map((text, i) => ({ id: `t${i}`, text, filler: false })),
      ...item.distractors.map((text, i) => ({ id: `d${i}`, text, filler: true })),
    ]),
  )
  const [built, setBuilt] = useState<Tile[]>([])
  const [graded, setGraded] = useState<{ result: Result; xp: number } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Space picks a tile up to reorder with the arrow keys; Enter taps it (removes it).
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] },
    }),
  )

  function place(tile: Tile) {
    if (graded) return
    setTray((t) => t.filter((x) => x.id !== tile.id))
    setBuilt((b) => [...b, tile])
  }

  function unplace(tile: Tile) {
    if (graded) return
    setBuilt((b) => b.filter((x) => x.id !== tile.id))
    setTray((t) => [...t, tile])
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setBuilt((b) => {
      const from = b.findIndex((t) => t.id === active.id)
      const to = b.findIndex((t) => t.id === over.id)
      return arrayMove(b, from, to)
    })
  }

  function check() {
    const result = gradeUpgrade(item, built.map((t) => t.text))
    const xp = xpFor(result)
    setGraded({ result, xp })
    onResult(result, xp)
  }

  function reset() {
    setTray((t) => shuffle([...t, ...built]))
    setBuilt([])
  }

  const fillerUsed = built.filter((t) => t.filler).map((t) => t.text)
  const missing = item.tiles.filter((text) => !built.some((t) => t.text === text))

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-lake p-5 text-on-lake">
        <p className="text-xs font-bold uppercase tracking-widest opacity-75">{item.context ?? 'Clunky thought'}</p>
        <p className="mt-2 font-display text-xl leading-snug opacity-90">“{item.clunky}”</p>
      </div>

      <section aria-label="Your sentence">
        <p className="mb-2 text-sm font-semibold text-muted">
          Your upgrade {built.length > 1 && !graded && <span className="font-normal">· drag to reorder, tap to remove</span>}
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={built.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
            <div
              className={`flex min-h-20 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3 ${
                graded
                  ? graded.result === 'best'
                    ? 'border-good bg-good-soft'
                    : graded.result === 'okay'
                      ? 'border-meh bg-meh-soft'
                      : 'border-bad bg-bad-soft'
                  : 'border-line bg-surface'
              }`}
            >
              {built.length === 0 && <span className="self-center px-1 text-sm text-muted">Tap words below to build a better sentence.</span>}
              {built.map((t) => (
                <SortableTile key={t.id} tile={t} locked={!!graded} onTap={() => unplace(t)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {!graded && (
        <>
          <section aria-label="Word tray">
            <p className="mb-2 text-sm font-semibold text-muted">Tiles · leave the filler behind</p>
            <div className="flex min-h-12 flex-wrap gap-2">
              {tray.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => place(t)}
                  className="rounded-xl border border-line bg-surface px-3 py-2 text-[15px] shadow-sm transition hover:border-lake active:scale-95"
                >
                  {t.text}
                </button>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <Button variant="ghost" onClick={reset} disabled={built.length === 0}>
              Reset
            </Button>
            <Button onClick={check} disabled={built.length === 0}>
              Check
            </Button>
          </div>
        </>
      )}

      {graded && (
        <Feedback result={graded.result} xp={graded.xp} why={item.why} save={{ text: item.answers[0].join(' ') }} onNext={onNext}>
          {graded.result !== 'best' && (
            <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4 text-sm">
              {graded.result === 'okay' && <p>Right words, filler gone — the order just reads less cleanly.</p>}
              {fillerUsed.length > 0 && (
                <p>
                  <strong className="text-bad">Filler slipped in:</strong> {fillerUsed.map((f) => `“${f}”`).join(', ')}
                </p>
              )}
              {missing.length > 0 && (
                <p>
                  <strong className="text-bad">Missing:</strong> {missing.map((f) => `“${f}”`).join(', ')}
                </p>
              )}
              <p className="mt-1 text-muted">Model answer</p>
              <p className="font-display text-lg leading-snug">{item.answers[0].join(' ')}</p>
            </div>
          )}
        </Feedback>
      )}
    </div>
  )
}

function SortableTile({ tile, locked, onTap }: { tile: Tile; locked: boolean; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tile.id,
    disabled: locked,
  })
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onTap}
      disabled={locked}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`touch-none rounded-xl px-3 py-2 text-[15px] font-medium shadow-sm ${
        locked && tile.filler ? 'bg-bad text-surface line-through' : 'bg-lake text-on-lake'
      } ${isDragging ? 'z-10 opacity-80 shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      {tile.text}
    </button>
  )
}
