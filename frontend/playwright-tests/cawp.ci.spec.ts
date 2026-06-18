import { expect, test } from './utils/fixtures'

test('CAWP: Congress', async ({ page }) => {
  await page.goto('/exploredata?mls=1.women_in_gov-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await page
    .getByRole('button', { name: 'Expand state/territory rate' })
    .click()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(rateMap.getByRole('heading', { name: 'Highest' }))
        .toBeVisible(),
      expect
        .soft(rateMap.getByRole('heading', { name: 'Lowest' }))
        .toBeVisible(),
    ])
  })

  const ratesOverTime = page.locator('#rates-over-time')
  await ratesOverTime.scrollIntoViewIfNeeded()

  await page.getByText('Expand rates over time table').click()

  await test.step('Verify Rates Over Time', async () => {
    await Promise.all([
      expect.soft(page.getByLabel('Include All women')).toBeVisible(),
    ])
  })

  await expect
    .soft(page.getByText('No unknown values for race/ethnicity reported'))
    .toBeVisible()
})

test('CAWP: County view loads with multi-district caveat', async ({ page }) => {
  // Fulton County GA (13121) spans multiple congressional districts
  await page.goto(
    '/exploredata?mls=1.women_in_gov-3.13121&group1=All&dt1=women_in_us_congress',
    { waitUntil: 'domcontentloaded' },
  )

  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('County congress data renders with percentage values', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', {
            name: /US Congress members identifying as women/i,
          }),
        )
        .toBeVisible(),
      // axis label confirms pct_rate metric is rendering
      expect.soft(rateChart.getByText('% women in Congress')).toBeVisible(),
    ])
  })

  await test.step('Multi-district caveat alert is visible', async () => {
    await expect
      .soft(
        page.getByText(/County figures include all U.S. Congress members/i),
      )
      .toBeVisible()
  })

  await test.step('State legislature metrics are not shown at county level', async () => {
    await expect
      .soft(page.getByText(/state legislature/i))
      .not.toBeVisible()
  })
})

test('CAWP: State Legislature', async ({ page }) => {
  await page.goto('/exploredata?mls=1.women_in_gov-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  await page.getByRole('button', { name: 'US Congress', exact: true }).click()
  await page.getByRole('menuitem', { name: 'State legislatures' }).click()
  await page.getByLabel('Race/Ethnicity:').click()
  await page.getByRole('button', { name: 'Black or African American' }).click()

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Content', async () => {
    await Promise.all([
      expect
        .soft(rateMap.getByRole('heading', { name: 'Percentage of state' }))
        .toBeVisible(),
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'Black or African American' }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByLabel('Click for more info on Women'))
        .toBeVisible(),
    ])
  })
})
