import { test } from '@playwright/test'

test('Diabetes', async ({ page }) => {
  await page.goto('/exploredata?mls=1.diabetes-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Diabetes in the United States' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Diabetes in the United States' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total adult diabetes cases' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Breakdown summary for' }).click()
  await page.getByText('Share this report:').click()
  await page
    .locator('#definitionsList')
    .getByText('Diabetes', { exact: true })
    .click()
  await page.getByText('Do you have information that').click()
})
