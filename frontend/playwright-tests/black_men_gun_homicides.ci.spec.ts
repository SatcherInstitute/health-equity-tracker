import { expect, test } from '@playwright/test'

test.describe('Black Men Homicide Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      '/exploredata?mls=1.gun_deaths_black_men-3.00&group1=All&demo=urbanicity',
    )
  })

  test('Black Men Homicide Test: Top Half of Cards', async ({ page }) => {
    await expect(page.getByText('City Size:')).toBeVisible()
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(
      page
        .locator('#rate-map')
        .getByRole('heading', { name: 'Rates of Black male gun' }),
    ).toBeVisible()
    await expect(
      page
        .locator('#rate-map')
        .getByRole('heading', { name: 'Black (NH) Men' }),
    ).toBeVisible()
    await expect(
      page
        .locator('li')
        .filter({ hasText: 'Total population of Black (NH) Men' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Rates of Black male gun homicide victims over time in the United States',
      }),
    ).toBeVisible()
    await expect(
      page
        .locator('#rates-over-time')
        .getByRole('heading', { name: 'Black (NH) Men' }),
    ).toBeVisible()
  })

  test('Black Men Homicide Test: Bottom Half of Cards', async ({ page }) => {
    await page.getByRole('button', { name: 'Rate chart' }).click()
    await expect(
      page
        .locator('#rate-chart')
        .getByRole('heading', { name: 'Rates of Black male gun' }),
    ).toBeVisible()
    await expect(
      page
        .locator('#rate-chart')
        .getByRole('heading', { name: 'Black (NH) Men' }),
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Inequities over time', exact: true })
      .click()
    await expect(
      page.getByRole('heading', { name: 'Historical relative inequity' }),
    ).toBeVisible()
    await expect(
      page
        .locator('#inequities-over-time')
        .getByRole('heading', { name: 'Black (NH) Men' }),
    ).toBeVisible()
    await page
      .locator('#inequities-over-time')
      .getByLabel('Highlight groups with lowest')
      .click()
    await page
      .getByRole('button', { name: 'Population vs. distribution' })
      .click()
    await expect(
      page
        .locator('#population-vs-distribution')
        .getByRole('heading', { name: 'Black (NH) Men' }),
    ).toBeVisible()
    await expect(
      page.getByLabel('Comparison bar chart showing').getByRole('img').nth(1),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Data table' }).click()
    await expect(
      page.getByRole('heading', { name: 'Summary of Black male gun' }),
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', {
        name: 'Share of total Black male gun',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Population share (Black NH,' }),
    ).toBeVisible()
  })
})
