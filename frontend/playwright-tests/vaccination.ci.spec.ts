import { expect, test } from './utils/fixtures'

test('National Vaccination Full Test', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid_vaccinations-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'COVID-19 vaccination rates in' }),
        )
        .toBeVisible(),
      expect.soft(page.getByText('Percentages Over 100%')).toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', {
            name: 'COVID-19 vaccination rates in',
          }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByLabel('Bar Chart Showing COVID-19'))
        .toBeVisible(),
    ])
  })

  // --- Share & Unknown Map Section ---
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  const unknownMap = page.locator('#unknown-demographic-map')
  await unknownMap.scrollIntoViewIfNeeded()

  await test.step('Verify Unknown Map', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Share of total COVID-19' }))
        .toBeVisible(),
      expect.soft(page.getByText('% unknown', { exact: true })).toBeVisible(),
      expect.soft(unknownMap.getByText('no data')).toBeVisible(),
    ])
  })

  // --- Population vs Distribution Section ---
  const popDist = page.locator('#population-vs-distribution')
  await popDist.scrollIntoViewIfNeeded()

  await test.step('Verify Pop vs Dist', async () => {
    await Promise.all([
      expect
        .soft(popDist.getByRole('heading', { name: 'Population vs. distribution' }))
        .toBeVisible(),
      expect.soft(page.getByLabel('light green bars represent %')).toBeVisible(),
      expect.soft(page.getByLabel('dark green bars represent %')).toBeVisible(),
    ])
  })

  // --- Summary Table Section ---
  await page.getByRole('heading', { name: 'Summary for COVID-19' }).scrollIntoViewIfNeeded()

  await test.step('Verify Summary Table', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Summary for COVID-19' }))
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('columnheader', { name: 'COVID-19 vaccination rates' }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('columnheader', { name: 'Share of total COVID-19' }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByRole('columnheader', { name: 'Population share' }))
        .toBeVisible(),
    ])
  })
})

test('State Vaccination Quick Test', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid_vaccinations-3.06&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'COVID-19 vaccination rates in' }),
        )
        .toBeVisible(),
      expect.soft(page.getByText('Percentages Over 100%')).toBeVisible(),
    ])
  })

  // --- Interaction: Switch Location ---
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'California' })
    .click()
  await page.getByRole('combobox').click()
  await page.getByRole('combobox').fill('los')
  await page
    .getByRole('option', { name: 'Los Angeles County, California' })
    .click()

  // Verify switch happened
  await expect(page).toHaveURL(/.*mls=1.covid_vaccinations-3.06037/)
})

test('County Vaccination Quick Test', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid_vaccinations-3.06037&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  await test.step('Verify Map Content', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', {
            name: 'COVID-19 vaccination rates in Los Angeles County, California',
            exact: true,
          }),
        )
        .toBeVisible(),
      expect.soft(page.getByText('This county has a social')).toBeVisible(),
    ])
  })
})