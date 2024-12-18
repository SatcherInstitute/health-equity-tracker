import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('News Tab Loads', async ({ page }) => {
  await page.goto('/news', { waitUntil: 'commit' })
  await expect(
    page.getByRole('heading', { name: 'News and Stories', exact: true }),
  ).toBeVisible()
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
