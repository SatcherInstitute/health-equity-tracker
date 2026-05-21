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

test('Category filter narrows and clears data source cards', async ({
  page,
}) => {
  await page.goto('/datacatalog', { waitUntil: 'commit' })

  // Wait for cards to render (metadata fetch required)
  const cards = page.getByRole('article')
  await expect(cards.first()).toBeVisible()
  const totalCount = await cards.count()

  // Scope filter clicks to the filter bar (avoids matching same-name card tags)
  const filterBar = page.getByText('Filter by topic').locator('..')

  // Selecting HIV should show fewer cards
  await filterBar.getByRole('button', { name: 'HIV', exact: true }).click()
  await expect(cards).not.toHaveCount(totalCount)
  const hivCount = await cards.count()
  expect(hivCount).toBeGreaterThan(0)

  // Adding a second category (Cancer) shows more cards than HIV alone
  await filterBar.getByRole('button', { name: 'Cancer', exact: true }).click()
  const combinedCount = await cards.count()
  expect(combinedCount).toBeGreaterThan(hivCount)

  // Clear button restores all cards
  await filterBar.getByRole('button', { name: /Clear/i }).click()
  await expect(cards).toHaveCount(totalCount)
})
