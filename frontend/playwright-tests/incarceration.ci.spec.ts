import { test } from '@playwright/test'

test('Prison by Race', async ({ page }) => {
  await page.goto('/exploredata?mls=1.incarceration-3.00&group1=All')
  await page
    .getByLabel(
      'Launch multiple maps view with side-by-side maps of each race and ethnicity group'
    )
    .click()
  await page.getByRole('button', { name: 'Close' }).click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByRole('heading', { name: 'People in prison' }).click()
  await page.getByLabel('close topic info modal').click()
  await page
    .locator('#rate-chart')
    .getByText(
      '3,232 children confined in adult facilities in the United States. Learn more.'
    )
    .click()

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
  await page.getByRole('columnheader', { name: 'Age' }).click()
  await page
    .getByRole('columnheader', { name: 'People in jail per 100k' })
    .click()
})
