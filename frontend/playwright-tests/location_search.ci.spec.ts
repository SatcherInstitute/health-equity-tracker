// Intentional misspellings and partial queries under test; keep them out
// of the shared dictionary so real typos elsewhere still get caught.
/* cSpell:ignore anasco, sarsota, denv, manua */
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

test('American Samoa districts are searchable and navigate', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.fill('manua')
  const district = page.getByRole('option', {
    name: "Manu'a District, American Samoa",
  })
  await expect(district).toBeVisible()
  await district.click()
  await expect(page).toHaveURL(/3\.60020/, { timeout: 8000 })
})

test('virtualization mounts only a small slice of the options', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.press('ArrowDown')
  await expect(page.getByRole('listbox')).toBeVisible()
  const optionCount = await page.getByRole('option').count()
  expect(optionCount).toBeGreaterThan(0)
  expect(optionCount).toBeLessThan(40)
  expect(
    await page.locator('ul[role="listbox"] li[role="presentation"]').count(),
  ).toBeGreaterThan(0)
})

test('aria-activedescendant resolves to a mounted option after scrolling', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.press('ArrowDown')
  await expect(page.getByRole('listbox')).toBeVisible()
  // Cross the initially mounted window so rows must scroll and remount.
  for (let i = 0; i < 20; i++) {
    await input.press('ArrowDown')
  }
  const activeId = await input.getAttribute('aria-activedescendant')
  expect(activeId).toBeTruthy()
  const activeOption = page.locator(`[id="${activeId}"]`)
  await expect(activeOption).toBeVisible()
  expect(await activeOption.getAttribute('role')).toBe('option')
})

test('arrow keys plus Enter navigate to the highlighted option', async ({
  page,
}) => {
  const input = await openLocationSearch(page)
  await input.press('ArrowDown')
  await expect(page.getByRole('listbox')).toBeVisible()
  // Wait for autoHighlight to land on the first option and for the list to
  // finish measuring and mounting its first window of rows.
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/)
  await expect(page.getByRole('option').nth(5)).toBeAttached()
  // Empty query keeps original order: United States, Alabama, Alaska, Arizona.
  await input.press('ArrowDown')
  await input.press('ArrowDown')
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(page).toHaveURL(/3\.04/, { timeout: 8000 })
})

test('virtualized options keep MUI option styling', async ({ page }) => {
  const input = await openLocationSearch(page)
  await input.press('ArrowDown')
  await expect(page.getByRole('listbox')).toBeVisible()
  // The custom listbox slot replaces MUI's default listbox, which is where
  // MUI defines option styles; the muiTheme paper override must restore them.
  const styles = await page
    .getByRole('option')
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        display: cs.display,
        alignItems: cs.alignItems,
        paddingLeft: cs.paddingLeft,
      }
    })
  expect(styles).toEqual({
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '24px',
  })
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
