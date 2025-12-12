import { expect, test } from './utils/fixtures'

test('Covid Cases', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_cases', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map & Rates Over Time ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map & Time Chart', async () => {
    await Promise.all([
      expect
        .soft(rateMap.getByRole('heading', { name: 'Rates of COVID-19 cases' }))
        .toBeVisible(),
      expect
        .soft(page.getByRole('heading', { name: 'Monthly COVID-19 cases per' }))
        .toBeVisible(),
    ])
  })

  // --- Rate Chart ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', { name: 'Rates of COVID-19 cases' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Population vs Distribution ---
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()

  await test.step('Verify Pop vs Dist', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Share of total COVID-19 cases' }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Population vs. distribution' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Inequities Over Time ---
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()

  await test.step('Verify Inequities', async () => {
    expect
      .soft(page.getByRole('heading', { name: 'Relative inequity for COVID-' }))
      .toBeVisible()
  })
})

test('Covid Deaths', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_deaths', {
    waitUntil: 'domcontentloaded',
  })

  // --- Rate Chart ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(rateChart.getByRole('heading', { name: 'Rates of COVID-19' }))
        .toBeVisible(),
    ])
  })

  // --- Share of Total ---
  await test.step('Verify Share of Total', async () => {
    expect
      .soft(page.getByRole('heading', { name: 'Share of total COVID-19' }))
      .toBeVisible()
  })

  // --- Inequities Over Time ---
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()

  await test.step('Verify Inequities', async () => {
    expect
      .soft(page.getByRole('heading', { name: 'Relative inequity for COVID-' }))
      .toBeVisible()
  })

  // --- Summary Table ---
  await page
    .getByRole('heading', { name: 'Summary for COVID-' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Summary', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Population vs. distribution' }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByRole('heading', { name: 'Summary for COVID-' }))
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Age-adjusted COVID-19 deaths' }),
        )
        .toBeVisible(),
    ])
  })
})

test('Covid Hospitalizations', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&dt1=covid_hospitalizations', {
    waitUntil: 'domcontentloaded',
  })

  // --- Rate Chart ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(rateChart.getByRole('heading', { name: 'Rates of COVID-19' }))
        .toBeVisible(),
      expect
        .soft(page.getByRole('heading', { name: 'Share of total COVID-19' }))
        .toBeVisible(),
    ])
  })

  // --- Inequities Over Time ---
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()

  await expect
    .soft(page.getByRole('heading', { name: 'Relative inequity for COVID-' }))
    .toBeVisible()
})
