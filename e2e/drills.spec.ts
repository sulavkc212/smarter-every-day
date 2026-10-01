import { expect, test, type Page, type TestInfo } from '@playwright/test'
import cafe from '../src/data/decks/lakeside-cafe.json' with { type: 'json' }

const shots = process.env.SHOTS_DIR

async function shot(page: Page, name: string, info: TestInfo) {
  if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-${name}.png`, fullPage: true })
}

/** The tab bar is at the bottom on phones and in the header on wider screens. */
function tabs(page: Page, info: TestInfo) {
  return page.getByRole('navigation', { name: info.project.name === 'mobile' ? 'Tabs' : 'Main' })
}

test('today shows the Daily 10, line of the day and sections', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByText("Start today's drills")).toBeVisible()
  await expect(page.getByText('Line of the day')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sections' })).toBeVisible()
  await shot(page, 'today', info)
})

test('tabs navigate between Today, Explore, Review and Me', async ({ page }, info) => {
  await page.goto('/')
  const nav = tabs(page, info)
  await nav.getByRole('link', { name: 'Explore' }).click()
  await expect(page.getByRole('heading', { name: 'Explore', level: 1 })).toBeVisible()
  await nav.getByRole('link', { name: 'Review' }).click()
  await expect(page.getByRole('heading', { name: 'Review', level: 1 })).toBeVisible()
  await nav.getByRole('link', { name: 'Me' }).click()
  await expect(page.getByRole('heading', { name: 'Me', level: 1 })).toBeVisible()
  await shot(page, 'me', info)
  await nav.getByRole('link', { name: 'Today' }).click()
  await expect(page.getByText("Start today's drills")).toBeVisible()
})

test('explore groups decks by section and locks later decks within a section', async ({ page }, info) => {
  await page.goto('/#/explore')
  for (const s of ['Everyday Talk', 'Conversation Craft', 'Charm & Wit', 'Culture Talk', 'Leadership']) {
    await expect(page.getByRole('heading', { name: s })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: /Lakeside Cafe Casual/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Openers/ })).toBeVisible()
  await expect(page.getByText(/^Unlocks at 60% of/)).toHaveCount(7)
  await shot(page, 'explore', info)
})

test('deck page lists its drills, including Word Power', async ({ page }, info) => {
  await page.goto('/#/deck/lakeside-cafe')
  await expect(page.getByRole('heading', { name: 'Lakeside Cafe Casual' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Word Power/ })).toBeVisible()
  await shot(page, 'deck', info)
})

test('choose the vibe: answering shows feedback, running out of time fails', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=vibe')
  await expect(page.getByText('Read the room…')).toBeVisible()
  const options = page.locator('ol button')
  await expect(options).toHaveCount(3)
  await options.first().click()
  await expect(page.getByText(/Nailed it|Close — not quite|Not that one/)).toBeVisible()
  await shot(page, 'vibe-feedback', info)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(options).toHaveCount(3)
  await expect(page.getByText("Time's up")).toBeVisible({ timeout: 12_000 })
})

test('yes, and: keyboard swipes sort every card, then a summary', async ({ page }) => {
  await page.goto('/#/play/lakeside-cafe?drill=yesAnd')
  await expect(page.getByRole('group', { name: 'Response card' })).toBeVisible()
  for (let i = 0; i < 4; i++) {
    if (await page.getByRole('button', { name: 'Continue' }).isVisible()) break
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(800)
  }
  await expect(page.getByText(/You sorted \d of \d correctly/)).toBeVisible()
})

test('yes, and: swiping by drag works', async ({ page }) => {
  await page.goto('/#/play/lakeside-cafe?drill=yesAnd')
  const card = page.getByRole('group', { name: 'Response card' })
  await expect(card).toBeVisible()
  const box = (await card.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 - 60, box.y + box.height / 2, { steps: 5 })
  await page.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect(page.getByText(/Right call|That one kept it going|That one killed it/)).toBeVisible()
})

test('sentence upgrader: building the model answer scores best; filler is a miss', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=upgrader')
  const clunky = await page.locator('p.font-display').first().innerText()
  const item = cafe.upgrader.find((u) => clunky.includes(u.clunky))!
  expect(item).toBeTruthy()
  const tray = page.getByRole('region', { name: 'Word tray' })
  for (const tile of item.tiles) await tray.getByRole('button', { name: tile, exact: true }).click()
  await shot(page, 'upgrader', info)
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.getByText('Nailed it')).toBeVisible()

  await page.getByRole('button', { name: 'Continue' }).click()
  const next = await page.locator('p.font-display').first().innerText()
  const item2 = cafe.upgrader.find((u) => next.includes(u.clunky))!
  await tray.getByRole('button', { name: item2.distractors[0], exact: true }).click()
  for (const tile of item2.tiles) await tray.getByRole('button', { name: tile, exact: true }).click()
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.getByText('Filler slipped in:')).toBeVisible()
})

test('word power: pick a word, see the meaning, save the line to Review', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=wordPower')
  await expect(page.getByText('Swap the tired word')).toBeVisible()
  await page.locator('ol button').first().click()
  await expect(page.getByText(/Nailed it|Close — not quite|Not that one/)).toBeVisible()
  await expect(page.getByText(/^Also:/)).toBeVisible()
  await shot(page, 'wordpower', info)
  const save = page.getByRole('button', { name: /Save this line/ })
  const line = (await save.locator('span span').nth(1).innerText()).replace(/[“”]/g, '')
  await save.click()
  await expect(page.getByText('Saved to your lines')).toBeVisible()
  await page.goto('/#/review')
  await expect(page.getByText(line, { exact: false })).toBeVisible()
})

test('knowledge drop-in: fact card with a source, then choose a line', async ({ page }) => {
  await page.goto('/#/play/lakeside-cafe?drill=dropIn')
  await expect(page.getByText('Fact card')).toBeVisible()
  await expect(page.getByText(/^Source:/)).toBeVisible()
  await page.getByRole('button', { name: 'Got it' }).click()
  await page.locator('ol button').first().click()
  await expect(page.getByText(/Nailed it|Close — not quite|Not that one/)).toBeVisible()
})

test('daily 10 starts a mixed session from open decks', async ({ page }) => {
  await page.goto('/')
  await page.getByText("Start today's drills").click()
  await expect(page.getByText(/1\/10/)).toBeVisible()
  await expect(page.getByText(/Daily 10/)).toBeVisible()
})

test('a full session ends on results; progress and review survive a reload', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=dropIn')
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: 'Got it' }).click()
    await page.locator('ol button').first().click()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await expect(page.getByText('Session complete')).toBeVisible()
  await shot(page, 'results', info)
  const xp = await page.getByLabel(/XP$/).innerText()
  await page.reload()
  await expect(page.getByLabel(/XP$/)).toHaveText(xp)
  await expect(page.getByLabel(/day streak$/)).toHaveText('1')
  await page.goto('/#/review')
  await expect(page.getByText(/to revisit/)).toBeVisible()
  await page.goto('/')
  await expect(page.getByText('Continue', { exact: true })).toBeVisible()
})

test('swipe buttons read "Dead end" and "Keeps it going"', async ({ page }) => {
  await page.goto('/#/play/lakeside-cafe?drill=yesAnd')
  await expect(page.getByRole('button', { name: 'Swipe left: dead end' })).toContainText('Dead end')
  await expect(page.getByRole('button', { name: 'Swipe right: keeps it going' })).toContainText('Keeps it going')
  await expect(page.getByText('Killer')).toHaveCount(0)
})

test('flagging a question as weird lists it on the Me tab', async ({ page }) => {
  await page.goto('/#/play/lakeside-cafe?drill=wordPower')
  const sentence = (await page.locator('p.font-display').first().innerText()).replace(/[“”]/g, '')
  await page.getByRole('button', { name: /Flag this question/ }).click()
  await expect(page.getByRole('button', { name: /Flagged as sounding weird/ })).toBeVisible()
  await page.goto('/#/me')
  await expect(page.getByRole('heading', { name: 'Flagged lines (1)' })).toBeVisible()
  await expect(page.getByText(sentence)).toBeVisible()
})

test('"Another round" brings new questions, not the ones just played', async ({ page }) => {
  // Lakeside Cafe has 20 Vibe questions, so two rounds of 10 should not overlap.
  test.setTimeout(90_000)
  await page.goto('/#/play/lakeside-cafe?drill=vibe')
  const scenario = () => page.locator('p.font-display').first().innerText()
  const firstRound: string[] = []
  for (let i = 0; i < 10; i++) {
    firstRound.push(await scenario())
    await page.locator('ol button').first().click()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await page.getByRole('button', { name: 'Another round' }).click()
  for (let i = 0; i < 3; i++) {
    expect(firstRound).not.toContain(await scenario())
    await page.locator('ol button').first().click()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
})

test('locked decks cannot be opened by URL', async ({ page }) => {
  await page.goto('/#/play/street-travel')
  await expect(page.getByRole('heading', { name: 'Explore', level: 1 })).toBeVisible()
})
