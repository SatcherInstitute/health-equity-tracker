// Intentional misspellings and partial queries under test; keep them out
// of the shared dictionary so real typos elsewhere still get caught.
/* cSpell:ignore anasco, sarsota, denv */
import { expect, test } from './utils/fixtures'

const BASE_URL = '/exploredata?mls=1.hiv-3.00&mlp=disparity'

async function openLocationSearch(page: import('@playwright/test').Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page
    .getByRole('button', { name: /united states/i })
    .first()
    .click()
  await expect(page.locator('.MuiPopover-paper')).toBeVisible()
  return page.getByPlaceholder('County, state, or territory...')
}

test('"Sarasota FL" ranks Sarasota County first and Enter navigates', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.fill('Sarasota FL')
  await expect(page.getByRole('option').first()).toHaveText(
    'Sarasota County, Florida',
  )
  await input.press('Enter')
  await expect(page).toHaveURL(/3\.12115/, { timeout: 8000 })
})

test('"DC" ranks District of Columbia first and selecting navigates', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.fill('DC')
  const first = page.getByRole('option').first()
  await expect(first).toHaveText('District of Columbia')
  await first.click()
  await expect(page).toHaveURL(/3\.11/, { timeout: 8000 })
})

test('"Saint John" finds St. John the Baptist Parish', async ({ page }) => {
  const input = await openLocationSearch(page)
  await input.fill('Saint John')
  await expect(
    page.getByRole('option', {
      name: 'St. John the Baptist Parish, Louisiana',
    }),
  ).toBeVisible()
})

test('diacritics are optional: "anasco" finds Añasco Municipio', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.fill('anasco')
  await expect(
    page.getByRole('option', { name: 'Añasco, Puerto Rico' }),
  ).toBeVisible()
  await input.fill('Añasco')
  await expect(
    page.getByRole('option', { name: 'Añasco, Puerto Rico' }),
  ).toBeVisible()
})

test('typo tolerance: "sarsota" still finds Sarasota County', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.fill('sarsota')
  await expect(
    page.getByRole('option', { name: 'Sarasota County, Florida' }),
  ).toBeVisible()
})

test('options list stays below the input in short viewports', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 500 })
  const input = await openLocationSearch(page)
  await input.fill('denv')
  const listbox = page.locator('ul[role="listbox"]')
  await expect(listbox).toBeVisible()
  const inputBox = await input.boundingBox()
  const listboxBox = await listbox.boundingBox()
  expect(listboxBox!.y).toBeGreaterThan(inputBox!.y + inputBox!.height - 1)
})
