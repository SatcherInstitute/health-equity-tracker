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
