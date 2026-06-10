import { expect, test } from './utils/fixtures'

const BASE_URL = '/exploredata?mls=1.hiv-3.06&mlp=disparity'
const STORAGE_KEY = 'het-recent-locations'

// Inject localStorage before React mounts so the hook reads it on first load —
// avoids a second page load compared to goto → evaluate → reload.
async function gotoWithHistory(
  page: import('@playwright/test').Page,
  codes: string[],
) {
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: STORAGE_KEY, value: codes },
  )
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
}

async function openGeoPicker(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /california/i }).first().click()
  await expect(page.locator('.MuiPopover-paper')).toBeVisible()
}

test('recent section visible with prior visits', async ({ page }) => {
  await gotoWithHistory(page, ['48'])
  await openGeoPicker(page)
  await expect(page.locator('.MuiPopover-paper').getByText('Recent')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Texas' })).toBeVisible()
})

test('X button clears recent list and hides the section', async ({ page }) => {
  await gotoWithHistory(page, ['48'])
  await openGeoPicker(page)
  await page.getByRole('button', { name: /clear recent locations/i }).click()
  await expect(page.locator('.MuiPopover-paper').getByText('Recent')).not.toBeVisible()
})

test('clicking a recent location navigates to that FIPS', async ({ page }) => {
  await gotoWithHistory(page, ['48'])
  await openGeoPicker(page)
  await page.getByRole('button', { name: 'Texas' }).click()
  await expect(page).toHaveURL(/3\.48/, { timeout: 8000 })
  await expect(page.locator('.MuiPopover-paper')).not.toBeVisible()
})
