import { test } from '@playwright/test'

test('Frequent Mental Distress', async ({ page }) => {
  await page.goto('/exploredata?mls=1.frequent_mental_distress-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Frequent mental distress in' })
    .click()
  await page
    .getByRole('button', { name: 'Expand state/territory rate' })
    .click()
  await page.getByText('Consider the possible impact').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Frequent mental distress in' })
    .click()
})
