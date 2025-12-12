import { expect, test } from './utils/fixtures'

// --- Test 1: Top Half (Map & Over Time Chart) ---
test('Black Men Homicide Test: Top Half of Cards', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.gun_deaths_black_men-3.00&group1=All&demo=urbanicity',
    { waitUntil: 'domcontentloaded' },
  )

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      // Verify Filter
      expect
        .soft(page.getByText('City Size:'))
        .toBeVisible(),
      expect.soft(page.getByRole('button', { name: 'All' })).toBeVisible(),

      // Check Map Headers
      expect
        .soft(rateMap.getByRole('heading', { name: 'Rates of Black male gun' }))
        .toBeVisible(),
      expect
        .soft(rateMap.getByRole('heading', { name: 'Black (NH) Men' }))
        .toBeVisible(),
    ])
  })

  // --- Rates Over Time Section ---
  const ratesOverTime = page.locator('#rates-over-time')
  await ratesOverTime.scrollIntoViewIfNeeded()

  await test.step('Verify Rates Over Time', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', {
            name: 'Rates of Black male gun homicide victims over time',
          }),
        )
        .toBeVisible(),
      expect
        .soft(ratesOverTime.getByRole('heading', { name: 'Black (NH) Men' }))
        .toBeVisible(),
    ])
  })
})

// --- Test 2: Bottom Half (Rate Chart, Inequities, Pop vs Dist, Table) ---
test('Black Men Homicide Test: Bottom Half of Cards', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.gun_deaths_black_men-3.00&group1=All&demo=urbanicity',
    { waitUntil: 'domcontentloaded' },
  )

  // --- Rate Chart Section ---
  await page.getByRole('button', { name: 'Rate chart' }).click()
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', { name: 'Rates of Black male gun' }),
        )
        .toBeVisible(),
      expect
        .soft(rateChart.getByRole('heading', { name: 'Black (NH) Men' }))
        .toBeVisible(),
    ])
  })

  // --- Inequities Over Time Section ---
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  const inequities = page.locator('#inequities-over-time')
  await inequities.scrollIntoViewIfNeeded()

  await test.step('Verify Inequities Over Time', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Historical relative inequity' }),
        )
        .toBeVisible(),
      expect
        .soft(inequities.getByRole('heading', { name: 'Black (NH) Men' }))
        .toBeVisible(),
      expect
        .soft(inequities.getByLabel('Highlight groups with lowest'))
        .toBeVisible(),
    ])
  })

  // --- Population vs Distribution Section ---
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  const popDist = page.locator('#population-vs-distribution')
  await popDist.scrollIntoViewIfNeeded()

  await test.step('Verify Population vs Distribution', async () => {
    await Promise.all([
      expect
        .soft(popDist.getByRole('heading', { name: 'Black (NH) Men' }))
        .toBeVisible(),
      expect
        .soft(
          page
            .getByLabel('Comparison bar chart showing')
            .getByRole('img')
            .first(),
        )
        .toBeVisible(),
    ])
  })

  // --- Data Table Section ---
  await page.getByRole('button', { name: 'Data table' }).click()
  await page
    .getByRole('heading', { name: 'Summary of Black male gun' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Data Table', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Summary of Black male gun' }))
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('columnheader', {
            name: 'Share of total Black male gun',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('columnheader', {
            name: 'Population share (Black NH,',
          }),
        )
        .toBeVisible(),
    ])
  })
})
