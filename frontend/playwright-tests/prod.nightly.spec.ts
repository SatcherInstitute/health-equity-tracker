import { test } from '@playwright/test'

test(`Production Site Loads`, async ({ page }) => {
  await page.goto('https://healthequitytracker.org', { waitUntil: 'commit' })
})
