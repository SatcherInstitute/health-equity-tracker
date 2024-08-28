import { test } from '@playwright/test'

test('Care Avoidance Due To Cost', async ({ page }) => {
  await page.goto('/exploredata?mls=1.avoided_care-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Care avoidance due to cost in the United States',
    })
    .click()
  await page
    .getByRole('button', { name: 'Expand state/territory rate' })
    .click()
  await page
    .getByText(
      'Consider the possible impact of data reporting gaps when interpreting the highest and lowest rates.',
    )
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Care avoidance due to cost in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Share of all care avoidance due to cost with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/territory level.',
    )
    .click()
  await page
    .getByRole('heading', {
      name: 'Population vs. distribution of total care avoidance due to cost in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Summary for care avoidance due to cost in the United States',
    })
    .click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Social Determinants of Health').click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page
    .getByText('Unfortunately there are crucial data missing in our sources.')
    .click()
  await page
    .getByRole('heading', { name: 'Missing and misidentified people' })
    .click()
  await page
    .getByRole('heading', { name: "Missing America's Health Rankings data" })
    .click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love to hear from you!',
    )
    .click()
})
