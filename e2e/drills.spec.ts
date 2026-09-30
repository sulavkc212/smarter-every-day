import { expect, test, type Page } from '@playwright/test'
import cafe from '../src/data/decks/lakeside-cafe.json' with { type: 'json' }

const shots = process.env.SHOTS_DIR

async function shot(page: Page, name: string, projectName: string) {
  if (shots) await page.screenshot({ path: `${shots}/${projectName}-${name}.png`, fullPage: true })
}

test('home shows decks, the line of the day, and locks later decks', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Namaste.' })).toBeVisible()
  await expect(page.getByText('Line of the day')).toBeVisible()
  await expect(page.getByRole('link', { name: /Lakeside Cafe Casual/ })).toBeVisible()
  await expect(page.getByText(/Unlocks at 70% mastery/)).toHaveCount(3)
  await shot(page, 'home', info.project.name)
})

test('choose the vibe: answering shows feedback, running out of time fails', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=vibe')
  await expect(page.getByText('Read the room…')).toBeVisible()
  const options = page.locator('ol button')
  await expect(options).toHaveCount(3)
  await shot(page, 'vibe', info.project.name)
  await options.first().click()
  await expect(page.getByText(/Nailed it|Close — not quite|Not that one/)).toBeVisible()
  await expect(page.getByText('Pattern')).toBeVisible()
  await shot(page, 'vibe-feedback', info.project.name)

  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(options).toHaveCount(3)
  await expect(page.getByText("Time's up")).toBeVisible({ timeout: 12_000 })
})

test('yes, and: keyboard swipes sort every card, then a summary', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=yesAnd')
  await expect(page.getByRole('group', { name: 'Response card' })).toBeVisible()
  await shot(page, 'yesand', info.project.name)
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

test('sentence upgrader: building the model answer scores best', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=upgrader')
  const clunky = await page.locator('p.font-display').first().innerText()
  const item = cafe.upgrader.find((u) => clunky.includes(u.clunky))!
  expect(item).toBeTruthy()
  const tray = page.getByRole('region', { name: 'Word tray' })
  for (const tile of item.tiles) await tray.getByRole('button', { name: tile, exact: true }).click()
  await shot(page, 'upgrader', info.project.name)
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.getByText('Nailed it')).toBeVisible()
})

test('sentence upgrader: leaving filler in is a miss', async ({ page }) => {
  await page.goto('/#/play/lakeside-cafe?drill=upgrader')
  const clunky = await page.locator('p.font-display').first().innerText()
  const item = cafe.upgrader.find((u) => clunky.includes(u.clunky))!
  const tray = page.getByRole('region', { name: 'Word tray' })
  await tray.getByRole('button', { name: item.distractors[0], exact: true }).click()
  for (const tile of item.tiles) await tray.getByRole('button', { name: tile, exact: true }).click()
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.getByText('Filler slipped in:')).toBeVisible()
})

test('knowledge drop-in: fact card, then choose a line', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=dropIn')
  await expect(page.getByText('Fact card')).toBeVisible()
  await expect(page.getByText(/^Source:/)).toBeVisible()
  await shot(page, 'dropin-fact', info.project.name)
  await page.getByRole('button', { name: 'Got it' }).click()
  await page.locator('ol button').first().click()
  await expect(page.getByText(/Nailed it|Close — not quite|Not that one/)).toBeVisible()
  await shot(page, 'dropin-feedback', info.project.name)
})

test('a full session ends on results, and progress survives a reload', async ({ page }, info) => {
  await page.goto('/#/play/lakeside-cafe?drill=dropIn')
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: 'Got it' }).click()
    await page.locator('ol button').first().click()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await expect(page.getByText('Session complete')).toBeVisible()
  await shot(page, 'results', info.project.name)
  const xp = await page.getByLabel(/XP$/).innerText()
  await page.reload()
  await expect(page.getByLabel(/XP$/)).toHaveText(xp)
  await expect(page.getByLabel(/day streak$/)).toHaveText('1')
  await page.goto('/')
  await expect(page.getByText(/ready to revisit/)).toBeVisible()
})

test('locked decks cannot be opened by URL', async ({ page }) => {
  await page.goto('/#/play/cheeky-flirty')
  await expect(page.getByRole('heading', { name: 'Namaste.' })).toBeVisible()
})
