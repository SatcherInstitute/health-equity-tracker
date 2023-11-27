import { test } from '@playwright/test'

test(`Site Loads`, async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' })
})
