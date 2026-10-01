import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/** Pull `--name: #hex` pairs out of one CSS block. */
function tokens(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]))
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const css = readFileSync('src/index.css', 'utf8')
const light = tokens(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {'))))
const darkStart = css.indexOf(":root[data-theme='dark'] {")
const dark = tokens(css.slice(darkStart, css.indexOf('}', darkStart)))

// [foreground, background]: every pair the UI uses for text.
const pairs: [string, string][] = [
  ...['ink', 'muted', 'lake', 'good', 'bad', 'meh', 'marigold-ink'].flatMap((fg) => [
    [fg, 'paper'] as [string, string],
    [fg, 'surface'] as [string, string],
  ]),
  ...['everyday', 'craft', 'charm', 'culture', 'leadership'].map((s) => [`sec-${s}`, 'surface'] as [string, string]),
  ['on-lake', 'lake'],
  ['lake', 'lake-soft'],
  ['good', 'good-soft'],
  ['bad', 'bad-soft'],
  ['meh', 'meh-soft'],
  ['muted', 'sunken'],
  ['ink', 'meh-soft'],
]

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme contrast', (_, t) => {
  it.each(pairs)('%s on %s is at least 4.5:1', (fg, bg) => {
    expect(t[fg], `missing --${fg}`).toBeDefined()
    expect(t[bg], `missing --${bg}`).toBeDefined()
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
  })
})

describe('fixed feedback banners', () => {
  it.each([
    ['#ffffff', '#15803d'],
    ['#14142b', '#ffb21e'],
    ['#ffffff', '#dc2626'],
    ['#ffffff', '#5b2ee6'],
    ['#ffffff', '#7c3aed'],
  ])('%s on %s is at least 4.5:1', (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
})
