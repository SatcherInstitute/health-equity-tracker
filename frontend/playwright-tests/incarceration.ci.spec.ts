import { test } from '@playwright/test'

test('Prison by Race', async ({ page }) => {
  await page.goto('/exploredata?mls=1.incarceration-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Prison incarceration in the' })
    .click()
  await page.getByLabel('Click for more info on people').click()
  await page.getByLabel('close topic info modal').click()
  await page.locator('li').filter({ hasText: 'United States' }).click()
  await page
    .getByRole('heading', { name: 'Graph unavailable: Rates of' })
    .click()
  await page.getByText('Our data sources do not have').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Prison incarceration in the' })
    .click()
  await page.locator('#rate-chart').getByText('children').click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .locator('#unknown-demographic-map')
    .getByText('0.4% of prison pop. reported')
    .click()
  await page.getByRole('button', { name: 'Data table' }).click()
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click()
  await page.getByRole('button', { name: 'Prison', exact: true }).click()
  await page.getByRole('button', { name: 'Jail' }).click()
})
test('Jail by Age', async ({ page }) => {
  await page.goto('/exploredata?mls=1.incarceration-3.00&group1=All&dt1=jail')
  await page
    .getByRole('combobox', { name: 'Demographic Race/ethnicity' })
    .click()
  await page.getByRole('option', { name: 'Age' }).click()
  await page.getByText('Age:').click()
  await page.getByRole('button', { name: '18+' }).click()
  await page.getByRole('heading', { name: 'Ages 18+' }).click()
  await page.getByLabel('Click for more info on people in jail').click()
  await page.getByRole('heading', { name: 'People in jail' }).click()
  await page.getByLabel('close topic info modal').click()
  await page.getByRole('button', { name: 'Data table' }).click()

  await page.getByRole('columnheader', { name: 'Age' }).click()
  await page
    .getByRole('columnheader', { name: 'People in jail per 100k' })
    .click()
})
