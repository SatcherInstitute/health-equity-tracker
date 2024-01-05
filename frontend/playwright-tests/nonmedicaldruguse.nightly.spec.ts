import { test } from '@playwright/test'

test('Non Medical Drug Use', async ({ page }) => {
  await page.goto('/exploredata?mls=1.substance-3.00&group1=All')

  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Non-medical drug use in the' })
    .click()
  await page.getByText('See the states/territories').click()
  await page.getByText('Consider the possible impact').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Non-medical drug use in the United States' })
    .click()
  await page
    .getByRole('heading', {
      name: 'Share of total non-medical drug use with unknown race and ethnicity in the United States',
    })
    .click()
  await page.getByText('No unknown values for race').click()
  await page
    .getByRole('heading', {
      name: 'Graph unavailable: Population vs. distribution of total non-medical drug use in the United States',
    })
    .click()
  await page.getByText('Our data sources do not have').click()
  await page
    .getByRole('heading', {
      name: 'Breakdown summary for opioid and other non-medical drug use in the United States',
    })
    .click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Behavioral Health').click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Unfortunately there are').click()
  await page
    .getByRole('heading', { name: "Missing America's Health Rankings data" })
    .click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love'
    )
    .click()
})
