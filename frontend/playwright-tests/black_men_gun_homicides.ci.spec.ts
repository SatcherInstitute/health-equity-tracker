import { test } from '@playwright/test'

test('Black Men Homicide Test: Top Half of Cards', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.gun_deaths_black_men-3.00&group1=All&demo=urbanicity',
  )
  await page.getByText('City Size:').click()
  await page.getByRole('button', { name: 'All' }).click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Rates of Black male gun' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Black (NH) Men' })
    .click()
  await page
    .locator('li')
    .filter({ hasText: 'Total population of Black (NH) Men' })
    .click()
  await page
    .getByRole('heading', {
      name: 'Rates of Black male gun homicide victims over time in the United States',
    })
    .click()
  await page
    .locator('#rates-over-time')
    .getByRole('heading', { name: 'Black (NH) Men' })
    .click()
})

test('Black Men Homicide Test: Bottom Half of Cards', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.gun_deaths_black_men-3.00&group1=All&demo=urbanicity',
  )
  await page.getByRole('button', { name: 'Rate chart' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of Black male gun' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Black (NH) Men' })
    .click()
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page
    .locator('#inequities-over-time')
    .getByRole('heading', { name: 'Black (NH) Men' })
    .click()
  await page
    .locator('#inequities-over-time')
    .getByLabel('Highlight groups with lowest')
    .click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'Black (NH) Men' })
    .click()
  await page.getByLabel('Comparison bar chart showing').getByRole('img').click()
  await page.getByRole('button', { name: 'Data table' }).click()
  await page.getByRole('heading', { name: 'Summary of Black male gun' }).click()
  await page
    .getByRole('columnheader', { name: 'Share of total Black male gun' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Population share (Black NH,' })
    .click()
})
