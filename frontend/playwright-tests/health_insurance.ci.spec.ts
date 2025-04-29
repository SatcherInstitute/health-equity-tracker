import { test } from '@playwright/test'

test('Health Insurance Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.health_insurance-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Uninsured people in the United States' })
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
      name: 'Rates of uninsurance over time in the United States',
    })
    .click()
  await page.getByText('Expand rates over time table').click()
  await page.getByText('View and download full .csv').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Uninsured people in the United States' })
    .click()
  await page
    .getByRole('heading', {
      name: 'Share of uninsured people with unknown race/ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/territory level.',
    )
    .click()
  await page
    .getByRole('heading', {
      name: 'Relative inequity for uninsurance in the United States',
    })
    .click()
  await page.getByRole('heading', { name: 'Relative inequity for' }).click()
  await page
    .locator('#inequities-over-time')
    .getByLabel('Highlight groups with lowest')
    .click()
  await page
    .locator('#inequities-over-time')
    .getByLabel('Clear demographic filters')
    .click()
  await page.getByText('Expand inequities over time').click()
  await page
    .locator('#inequities-over-time')
    .getByText('View and download full .csv')
    .click()
  await page
    .getByRole('heading', {
      name: 'Population vs. distribution of total uninsured people in the United States',
    })
    .click()
})
