import { expect, test } from './utils/fixtures'

const BASE_URL = '/exploredata?mls=1.hiv-3.06&mlp=disparity'
const STORAGE_KEY = 'het-recent-locations'

// Seed localStorage with prior visits then reload so the hook picks them up.
async function seedRecentHistory(page: import('@playwright/test').Page, codes: string[]) {
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, JSON.stringify(value)),
    [STORAGE_KEY, codes],
  )
  await page.reload({ waitUntil: 'domcontentloaded' })
}

async function openGeoPicker(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /california/i }).first().click()
  await expect(page.locator('.MuiPopover-paper')).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(([key]) => localStorage.removeItem(key), [STORAGE_KEY])
})

test('recent section visible with prior visits', async ({ page }) => {
  await seedRecentHistory(page, ['48']) // Texas
  await openGeoPicker(page)
  await expect(page.locator('.MuiPopover-paper').getByText('Recent')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Texas' })).toBeVisible()
})

test('current location filtered from recent list', async ({ page }) => {
  await seedRecentHistory(page, ['06', '48']) // California (current), Texas
  await openGeoPicker(page)
  // Texas visible, California not (it's the current view)
  await expect(page.getByRole('button', { name: 'Texas' })).toBeVisible()
  await expect(
    page.locator('.MuiPopover-paper').getByRole('button', { name: 'California' }),
  ).toHaveCount(0)
})

test('X button clears recent list and hides the section', async ({ page }) => {
  await seedRecentHistory(page, ['48'])
  await openGeoPicker(page)
  await page.getByRole('button', { name: /clear recent locations/i }).click()
  await expect(page.locator('.MuiPopover-paper').getByText('Recent')).not.toBeVisible()
})

test('clicking a recent location navigates to that FIPS', async ({ page }) => {
  await seedRecentHistory(page, ['48']) // Texas = FIPS 48
  await openGeoPicker(page)
  await page.getByRole('button', { name: 'Texas' }).click()
  await expect(page).toHaveURL(/3\.48/, { timeout: 8000 })
  await expect(page.locator('.MuiPopover-paper')).not.toBeVisible()
})
