import { test } from '@playwright/test'

test('HIV PrEP: Rate Map', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_prep-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'PrEP coverage in the United' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Ages 16+' })
    .click()
})

test('HIV PrEP: Rates Over Time', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_prep-3.00&group1=All&demo=sex')
  await page
    .getByRole('button', { name: 'Rates over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Rates of PrEP coverage over' })
    .click()
  await page.getByLabel('Include All').click()
  await page.getByLabel('Include Female').click()
  await page.getByLabel('Include Male').click()
  await page.getByText('% PrEP coverage →').click()
  await page
    .getByRole('button', { name: 'Expand rates over time table' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Time period (2017 - 2021)' })
    .click()
  await page.getByRole('columnheader', { name: 'All % PrEP coverage' }).click()
  await page
    .getByRole('columnheader', { name: 'Female % PrEP coverage' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Male % PrEP coverage', exact: true })
    .click()
  await page
    .getByText('Rates of PrEP coverage over time in the United States by sex')
    .click()
  await page
    .locator('#rates-over-time')
    .getByText("Due to COVID-19's effects on")
    .click()
})

test('HIV PrEP: Rate chart', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_prep-3.00&group1=All&demo=sex')
  await page.getByRole('button', { name: 'Rate chart', exact: true }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'PrEP coverage in the United' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Ages 16+' })
    .click()
  await page.getByRole('heading', { name: 'Share of total PrEP' }).click()
})

test('HIV PrEP: Inequities over time and down', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_prep-3.00&group1=All&demo=sex')
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page.locator('#inequities-over-time').getByLabel('Include Male').click()
  await page
    .getByRole('button', { name: 'Expand inequities over time table' })
    .click()
  await page
    .locator('#inequities-over-time')
    .getByText('Add or remove columns by')
    .click()
  await page
    .locator('#inequities-over-time')
    .getByRole('columnheader', { name: 'Time period (2017 - 2021)' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Male % relative inequity' })
    .click()
  await page
    .getByText(
      'Historical relative inequity for PrEP coverage in the United States by sex',
    )
    .click()
  await page
    .locator('#inequities-over-time')
    .getByText("Due to COVID-19's effects on")
    .click()
  await page.getByText('This graph visualizes the').click()
  await page
    .getByRole('heading', { name: 'PrEP-eligible population vs.' })
    .click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'Ages 16+' })
    .click()
  await page.getByRole('heading', { name: 'Summary for PrEP' }).click()
  await page.getByRole('columnheader', { name: 'Sex' }).click()
  await page.getByRole('cell', { name: 'Female' }).click()
})
