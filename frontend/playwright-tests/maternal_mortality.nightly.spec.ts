import { test } from '@playwright/test'

test('Maternal Mortality', async ({ page }) => {
  await page.goto('/exploredata?mls=1.maternal_mortality-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Maternal mortality in the' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'New Mothers, Ages 10-' })
    .click()
  await page.getByLabel('Legend for rate map').getByRole('img').click()
  await page
    .locator('li')
    .filter({ hasText: 'Total population of New' })
    .click()
  await page
    .getByRole('heading', {
      name: 'Rates of maternal mortality over time in the United States',
    })
    .click()
  await page
    .locator('#rates-over-time')
    .getByRole('heading', { name: 'New Mothers, Ages 10-' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Maternal mortality in the' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'New Mothers, Ages 10-' })
    .click()
  await page.getByLabel('Bar Chart showing Maternal').click()
  await page
    .getByRole('heading', { name: 'Share of maternal mortality' })
    .click()
  await page
    .locator('article')
    .filter({ hasText: 'Share of maternal mortality' })
    .click()
  await page.getByText('No unknown values for race').click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'New Mothers, Ages 10-' })
    .click()
  await page.getByLabel('Comparison bar chart showing').getByRole('img').click()
  await page.getByRole('heading', { name: 'Summary for maternal' }).click()
  await page
    .getByRole('figure', { name: 'Summary for maternal' })
    .locator('h4')
    .click()
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click()
  await page.getByRole('columnheader', { name: 'Maternal mortality' }).click()
  await page
    .getByRole('columnheader', { name: 'Share of total maternal deaths' })
    .click()
  await page.getByRole('columnheader', { name: 'Share of live births' }).click()

  // TODO: re-enable once methodology for maternal mortality is live on PROD
  // await page.getByRole('heading', { name: 'Definitions:' }).click()
  // await page.getByRole('heading', { name: 'Maternal Health' }).click()
  // await page.locator('#definitionsList').getByText('Maternal mortality').click()
  // await page.getByText('Maternal deaths per 100,000').click()
})
