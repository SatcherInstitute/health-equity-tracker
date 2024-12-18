import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('Data Catalog Loads', async ({ page }) => {
  await page.goto('/datacatalog', { waitUntil: 'commit' })
  await expect(
    page.getByRole('heading', { name: 'Data Downloads', level: 1 }),
  ).toBeVisible()
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
