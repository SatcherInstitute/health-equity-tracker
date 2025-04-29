import { test } from '@playwright/test'

test('Suicide USA', async ({ page }) => {
  await page.goto('/exploredata?mls=1.suicide-3.00&group1=All')
  await page.getByText('Suicide & Crisis Lifeline').click()
  await page.getByText('For 24/7, free and').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Suicides in the United States' })
    .click()
  await page
    .getByRole('button', { name: 'Expand state/territory rate' })
    .click()
  await page.getByText('Consider the possible impact').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Suicides in the United States' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total suicides with' })
    .click()
  await page.getByText('No unknown values for race').click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for' }).click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Behavioral Health').click()
  await page.locator('#definitionsList').getByText('Suicides').click()
})

test('Suicide California Showing Counties', async ({ page }) => {
  await page.goto('/exploredata?mls=1.suicide-3.06&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Suicides in California' })
    .click()
  await page
    .getByRole('button', { name: 'Expand county rate extremes' })
    .click()
  await page.getByRole('heading', { name: 'Highest:' }).click()
  await page.getByRole('heading', { name: 'Lowest:' }).click()
  await page.getByRole('heading', { name: 'State overall:' }).click()
  await page.getByText('All rates are reported as:').click()
  await page
    .getByRole('button', { name: 'Collapse county rate extremes' })
    .click()
  // click a county
  await page.locator('path:nth-child(3)').first().click()
})
test('Suicide Los Angeles County', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.suicide-3.06037&group1=All&demo=race_and_ethnicity',
  )
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Suicides in Los Angeles County,' })
    .click()
  await page.getByText('social vulnerability index').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Suicides in Los Angeles County,' })
    .click()
  await page.getByLabel('Bar Chart showing Suicides in').click()
  await page
    .getByRole('heading', { name: 'Share of total suicides with' })
    .click()
  await page
    .getByRole('heading', { name: 'Graph unavailable: Population' })
    .click()
  await page.getByRole('heading', { name: 'Summary for' }).click()
  await page.getByRole('columnheader', { name: 'Race/Ethnicity' }).click()
  await page
    .getByRole('columnheader', { name: 'Suicides per 100k people' })
    .click()
  // Update values if data changes
  await page.getByRole('cell', { name: 'Asian (NH)' }).click()
  await page
    .getByRole('cell', { name: 'Black or African American (NH)' })
    .click()
})
