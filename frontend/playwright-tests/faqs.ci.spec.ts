import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('FAQ Tab Loads', async ({ page }) => {
  await page.goto('/faqs', { waitUntil: 'commit' })
  await expect(page).toHaveTitle(
    'Frequently Asked Questions - Health Equity Tracker',
  )

  const heading = await page.getByRole('heading', {
    name: 'Frequently Asked Questions',
    level: 1,
  })
  await expect(heading).toBeVisible()

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
