import { expect, test } from './utils/fixtures'

test('HIV Black Women: Prevalance Top Cards', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_black_women-3.00', {
    waitUntil: 'domcontentloaded',
  })

  await page.getByLabel('Age:').click()
  await page.getByRole('button', { name: '+' }).click()

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', {
            name: 'HIV prevalence for Black (NH',
          }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByRole('heading', { name: 'Ages 65+' }))
        .toBeVisible(),
    ])
  })

  const ratesOverTime = page.locator('#rates-over-time')
  await ratesOverTime.scrollIntoViewIfNeeded()

  await test.step('Verify Rates Over Time', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', {
            name: 'HIV prevalence for Black (NH) women over time',
          }),
        )
        .toBeVisible(),
      expect.soft(page.getByLabel('Include 65+')).toBeVisible(),
    ])
  })

  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', {
            name: 'HIV prevalence for Black (NH',
          }),
        )
        .toBeVisible(),
      expect
        .soft(rateChart.getByRole('heading', { name: 'Ages 13+' }))
        .toBeVisible(),
    ])
  })
})

test('HIV Black Women: Prevalance Bottom Cards', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_black_women-3.00', {
    waitUntil: 'domcontentloaded',
  })

  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  const inequities = page.locator('#inequities-over-time')
  await inequities.scrollIntoViewIfNeeded()

  await test.step('Verify Inequities', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Historical relative inequity' }),
        )
        .toBeVisible(),
      expect.soft(inequities.getByLabel('Include 65+')).toBeVisible(),
      expect.soft(page.getByText('← disproportionately low')).toBeVisible(),
      expect
        .soft(
          page.getByRole('button', {
            name: 'Expand inequities over time table',
          }),
        )
        .toBeVisible(),
    ])
  })

  const popDist = page.locator('#population-vs-distribution')
  await popDist.scrollIntoViewIfNeeded()

  await test.step('Verify Pop vs Dist', async () => {
    await Promise.all([
      expect
        .soft(popDist.getByRole('heading', { name: 'Ages 13+' }))
        .toBeVisible(),
      expect
        .soft(
          page.getByText(
            'Black or African-American (NH) women ages 13+ living with HIV (diagnosed &',
          ),
        )
        .toBeVisible(),
    ])
  })

  await page
    .getByRole('button', { name: 'Prevalence for Black Women', exact: true })
    .click()
  await page
    .getByRole('menuitem', { name: 'New Diagnoses for Black Women' })
    .click()

  await test.step('Verify Missing Data Info', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Missing data for HIV deaths,' }),
        )
        .toBeVisible(),
      expect.soft(page.getByText('County-level data is')).toBeVisible(),
      expect.soft(page.getByText('To protect personal privacy,')).toBeVisible(),
    ])
  })
})

test('HIV Black Women: Diagnoses', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.hiv_black_women-3.00&group1=All&dt1=hiv_diagnoses_black_women',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', {
            name: 'New HIV diagnoses for Black (',
          }),
        )
        .toBeVisible(),
      expect
        .soft(rateMap.getByRole('heading', { name: 'Ages 13+' }))
        .toBeVisible(),
    ])
  })

  await page
    .getByRole('button', { name: 'New Diagnoses for Black Women' })
    .click()
  await page.getByRole('menuitem', { name: 'Deaths for Black women' }).click()

  // FIX: Made the name more specific to avoid strict mode collision
  await expect
    .soft(
      page.getByRole('heading', {
        name: 'Rates of HIV deaths for Black (NH) women',
      }),
    )
    .toBeVisible()
})

test('HIV Black Women: Deaths', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.hiv_black_women-3.00&group1=All&dt1=hiv_deaths_black_women',
    { waitUntil: 'domcontentloaded' },
  )

  const ratesOverTime = page.locator('#rates-over-time')
  await ratesOverTime.scrollIntoViewIfNeeded()

  await test.step('Verify Rates Over Time', async () => {
    await Promise.all([
      expect
        .soft(
          ratesOverTime.getByRole('heading', {
            name: 'Rates of HIV deaths for Black',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('button', { name: 'Expand rates over time table' }),
        )
        .toBeVisible(),
    ])
  })

  await page.getByRole('button', { name: 'Definitions & missing data' }).click()

  await test.step('Verify Definitions', async () => {
    await Promise.all([
      expect.soft(page.getByText('New HIV diagnoses for Black')).toBeVisible(),
      expect
        .soft(
          page.getByText(
            'Black or African-American (NH) women ages 13+ diagnosed with HIV in a',
          ),
        )
        .toBeVisible(),
      expect
        .soft(page.getByText('HIV deaths for Black women', { exact: true }))
        .toBeVisible(),
      expect
        .soft(
          page.getByText(
            'Black or African-American (NH) women ages 13+ who died from HIV or AIDS in a',
          ),
        )
        .toBeVisible(),
    ])
  })

  await test.step('Verify Missing Data Info', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'What data are missing?' }))
        .toBeVisible(),
      expect.soft(page.getByText('Currently, there are no')).toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Missing data for HIV deaths,' }),
        )
        .toBeVisible(),
      expect.soft(page.getByText("There isn't enough data to")).toBeVisible(),
      expect.soft(page.getByText('The Asian category includes')).toBeVisible(),
    ])
  })
})
