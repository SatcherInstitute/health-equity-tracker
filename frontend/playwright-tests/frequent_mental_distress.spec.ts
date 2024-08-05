import { test } from '@playwright/test'

test('Frequent Mental Distress', async ({ page }) => {
  await page.goto('/exploredata?mls=1.frequent_mental_distress-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Frequent mental distress in' })
    .click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(2).click()
  await page.locator('#menu- div').first().click()
  await page
    .getByRole('button', { name: 'Expand state/territory rate' })
    .click()
  await page.getByText('Consider the possible impact').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Frequent mental distress in' })
    .click()
})
