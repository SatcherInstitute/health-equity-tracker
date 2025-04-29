import { test } from '@playwright/test'

test('Depression Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.depression-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Depression in the United' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Ages 18+' })
    .click()
  await page
    .getByRole('button', { name: 'Rates over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Depression cases over time in' })
    .click()
  await page
    .locator('#rates-over-time')
    .getByRole('heading', { name: 'Ages 18+' })
    .click()
  await page.getByText('cases per 100k adults →').click()
  await page.getByText('time →').click()
  await page
    .locator('#rates-over-time')
    .getByText('Note. (NH) indicates ‘Non-')
    .click()
  await page.getByRole('button', { name: 'Rate chart' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Depression in the United' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Ages 18+' })
    .click()
  await page.locator('#rate-chart').getByText('race/ethnicity').click()
  await page.locator('#rate-chart').getByText('cases per 100k adults').click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page.getByText('No unknown values for race').click()
  await page.getByRole('button', { name: 'Data table' }).click()
  await page
    .getByRole('heading', { name: 'Summary for depression in the' })
    .click()
  await page
    .getByRole('figure', { name: 'Summary for depression in the' })
    .locator('h4')
    .click()
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click()
  await page
    .getByRole('columnheader', { name: 'Cases of depression per 100k' })
    .click()
  await page.getByRole('columnheader', { name: 'Share of total adult' }).click()
  await page.getByRole('columnheader', { name: 'Population share' }).click()
})
