import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('FAQ Tab Loads', async ({ page }) => {
  await page.goto('/faqs', { waitUntil: 'commit' })
  await expect(page).toHaveTitle(
    'Frequently Asked Questions - Health Equity Tracker',
  )

  const heading = await page.getByRole('heading', {
    name: 'Frequently Asked Questions',
  })
  await expect(heading).toBeVisible()

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
