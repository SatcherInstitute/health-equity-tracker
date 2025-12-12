import { expect, test } from './utils/fixtures'

test('HIV: Prevalance', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_prevalence', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map & Time Chart Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map & Time Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', {
            name: 'HIV prevalence in the United',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'HIV prevalence over time in' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await expect
      .soft(
        rateChart.getByRole('heading', {
          name: 'HIV prevalence in the United',
        }),
      )
      .toBeVisible()
  })

  // --- Share & Inequity Section ---
  await test.step('Verify Share & Inequity', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Share of total HIV prevalence' }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Historical relative inequity' }),
        )
        .toBeVisible(),
    ])
  })
})

test('HIV: Diagnoses', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_diagnoses', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map & Time Chart Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map & Time Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'HIV diagnoses in the United' }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByRole('heading', { name: 'HIV diagnoses over time in' }))
        .toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await expect
      .soft(
        rateChart.getByRole('heading', { name: 'HIV diagnoses in the United' }),
      )
      .toBeVisible()
  })

  // --- Share & Inequity Section ---
  await test.step('Verify Share & Inequity', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Share of total HIV diagnoses' }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Historical relative inequity' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Population vs Distribution Section ---
  const popDist = page.locator('#population-vs-distribution')
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await popDist.scrollIntoViewIfNeeded()

  await test.step('Verify Pop vs Dist', async () => {
    await expect
      .soft(
        popDist.getByRole('heading', { name: 'Population vs. distribution' }),
      )
      .toBeVisible()
  })

  // --- Summary & Footer Section ---
  await page
    .getByRole('heading', { name: 'Summary for HIV' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Summary & Footer', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Summary for HIV' }))
        .toBeVisible(),
      expect
        .soft(page.getByText('New HIV diagnoses', { exact: true }))
        .toBeVisible(),
    ])
  })
})

test('HIV: Deaths', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_deaths', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map & Time Chart Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map & Time Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'HIV deaths in the United' }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Rates of HIV deaths over time' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await expect
      .soft(
        rateChart.getByRole('heading', { name: 'HIV deaths in the United' }),
      )
      .toBeVisible()
  })

  // --- Share Section ---
  await test.step('Verify Share', async () => {
    await expect
      .soft(page.getByRole('heading', { name: 'Share of total HIV deaths' }))
      .toBeVisible()
  })
})
