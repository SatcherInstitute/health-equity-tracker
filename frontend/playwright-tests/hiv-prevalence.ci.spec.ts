import { test } from '@playwright/test'

test('hiv prevalence', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&group1=All')
  await page.locator('#landingPageCTA').click()
  await page.getByRole('button', { name: 'select a topic' }).click()
  await page.getByRole('button', { name: 'HIV', exact: true }).click()
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'HIV prevalence in the United' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .getByRole('heading', { name: 'HIV prevalence over time in' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'HIV prevalence in the United' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total HIV prevalence' })
    .click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Breakdown summary for HIV' }).click()
  await page.getByText('Share this report:').click()
  await page.getByText('HIV prevalence', { exact: true }).click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Do you have information that').click()
})
