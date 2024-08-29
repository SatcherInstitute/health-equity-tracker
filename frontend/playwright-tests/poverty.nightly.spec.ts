import { test } from '@playwright/test'

test('Poverty', async ({ page }) => {
  await page.goto('/exploredata?mls=1.poverty-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'People below the poverty line in the United States',
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
    .getByRole('heading', {
      name: 'Rates of poverty over time in the United States',
    })
    .click()
  await page
    .getByRole('button', { name: 'Expand rates over time table' })
    .click()
  await page.getByText('Add or remove columns by').click()
  await page.getByText('View and download full .csv').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'People below the poverty line in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Share of poverty with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/territory level.',
    )
    .click()
  await page
    .getByRole('heading', {
      name: 'Relative inequity for poverty in the United States',
    })
    .click()
  await page.getByText('Expand inequities over time').click()
  await page
    .getByRole('heading', {
      name: 'Population vs. distribution of total people below the poverty line in the United States',
    })
    .click()
  await page.getByText('Population percentages on').click()
  await page
    .getByRole('heading', {
      name: 'Summary for people below the poverty line in the United States',
    })
    .click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Social Determinants of Health').click()
  await page
    .locator('#definitionsList')
    .getByText('People below the poverty line')
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page
    .getByRole('heading', { name: 'Missing and misidentified people' })
    .click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love to hear from you!',
    )
    .click()
})
