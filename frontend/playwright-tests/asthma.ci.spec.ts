import { test } from '@playwright/test'

test('Asthma', async ({ page }) => {
  await page.goto('/exploredata?mls=1.asthma-3.00&group1=All')
  await page.getByText('Race/Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Asthma in the United States' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Asthma in the United States' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of all adult asthma cases' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for asthma' }).click()
})
