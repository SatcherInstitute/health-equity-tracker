import { expect, test } from './utils/fixtures'

test('Health Insurance Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.health_insurance-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', {
            name: 'Uninsured people in the United States',
          }),
        )
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
            name: 'Rates of uninsurance over time',
          }),
        )
        .toBeVisible(),
      expect.soft(page.getByText('Expand rates over time table')).toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await expect
      .soft(
        rateChart.getByRole('heading', {
          name: 'Uninsured people in the United States',
        }),
      )
      .toBeVisible()
  })

  // --- Unknown Values Section ---
  await test.step('Verify Unknown Values', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', {
            name: 'Share of uninsured people with unknown',
          }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByText('No unknown values for race/ethnicity reported'))
        .toBeVisible(),
    ])
  })

  // --- Inequities Over Time Section ---
  const inequities = page.locator('#inequities-over-time')
  await inequities.scrollIntoViewIfNeeded()

  await test.step('Verify Inequities Over Time', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', {
            name: 'Relative inequity for uninsurance',
          }),
        )
        .toBeVisible(),
      expect
        .soft(inequities.getByLabel('Highlight groups with lowest'))
        .toBeVisible(),
      expect.soft(page.getByText('Expand inequities over time')).toBeVisible(),
    ])
  })

  // --- Population vs Distribution Section ---
  const popDist = page.locator('#population-vs-distribution')
  await popDist.scrollIntoViewIfNeeded()

  await test.step('Verify Pop vs Dist', async () => {
    await expect
      .soft(
        popDist.getByRole('heading', {
          name: 'Population vs. distribution',
        }),
      )
      .toBeVisible()
  })
})
