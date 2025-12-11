import { test } from '@playwright/test'

test('HIV Linkage To Care', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_care-3.00&group1=All&demo=age')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Linkage to HIV care in the' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'People diagnosed with HIV,' })
    .click()

  await page
    .getByRole('button', { name: 'Rates over time', exact: true })
    .click()
  await page
    .getByRole('heading', {
      name: 'Rates of linkage to HIV care over time in the United States',
    })
    .click()
  await page
    .locator('#rates-over-time')
    .getByRole('heading', { name: 'People diagnosed with HIV,' })
    .click()
  await page.getByText('% linkage →').click()
  await page.getByText('time →').click()
  await page.getByRole('button', { name: 'Rate chart' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Linkage to HIV care in the' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'People diagnosed with HIV,' })
    .click()
  await page.getByText('age', { exact: true }).click()
  await page
    .getByLabel('Bar Chart Showing Linkage to')
    .getByText('% linkage')
    .click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page
    .locator('#inequities-over-time')
    .getByRole('heading', { name: 'People diagnosed with HIV,' })
    .click()
  await page.getByText('disproportionately high →').click()
  await page.getByText('← disproportionately low').click()
  await page.locator('#inequities-over-time').getByText('time →').click()
  await page.getByText('This graph visualizes the').click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Diagnosed population vs.' }).click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'People diagnosed with HIV,' })
    .click()
  await page
    .getByRole('img', { name: 'light green bars represent %' })
    .locator('circle')
    .click()
  await page
    .getByRole('img', { name: 'dark green bars represent %' })
    .locator('circle')
    .click()
  await page
    .getByLabel('Comparison bar chart showing')
    .getByText('age', { exact: true })
    .click()
  await page.getByText('% of diagnosed population vs').click()
  await page.getByRole('button', { name: 'Data table' }).click()
  await page
    .getByRole('heading', { name: 'Summary for linkage to HIV' })
    .click()
  await page.getByRole('columnheader', { name: 'Age', exact: true }).click()
  await page
    .getByRole('columnheader', { name: 'Linkage to HIV care', exact: true })
    .click()
  await page
    .getByRole('columnheader', { name: 'Share of total linkage to HIV' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Diagnosed population share (' })
    .click()
})
