import { expect, test } from './utils/fixtures'

test('Diabetes USA', async ({ page }) => {
  await page.goto('/exploredata?mls=1.diabetes-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await expect
      .soft(
        rateMap.getByRole('heading', { name: 'Diabetes in the United States' }),
      )
      .toBeVisible()
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await expect
      .soft(
        rateChart.getByRole('heading', {
          name: 'Diabetes in the United States',
        }),
      )
      .toBeVisible()
  })

  // --- Share & Population Section ---
  await page
    .getByRole('heading', { name: 'Share of total adult diabetes cases' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Share and Population Views', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', {
            name: 'Share of total adult diabetes cases',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Population vs. distribution' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Summary & Definitions ---
  await page
    .getByRole('heading', { name: 'Summary for' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Summary & Footer', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Summary for' }))
        .toBeVisible(),
      expect.soft(page.getByText('Share this report:')).toBeVisible(),
      expect
        .soft(
          page
            .locator('#definitionsList')
            .getByText('Diabetes', { exact: true }),
        )
        .toBeVisible(),
    ])
  })
})

test('Diabetes County', async ({ page }) => {
  await page.goto('/exploredata?mls=1.diabetes-3.08031&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'Diabetes in Denver County,' }),
        )
        .toBeVisible(),
      expect
        .soft(rateMap.getByRole('heading', { name: 'Ages 18+' }))
        .toBeVisible(),
    ])
  })

  // --- List Item Check ---
  await expect
    .soft(page.locator('li').filter({ hasText: 'Denver County' }).first())
    .toBeVisible()

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', {
            name: 'Diabetes in Denver County,',
          }),
        )
        .toBeVisible(),
      expect
        .soft(rateChart.getByRole('heading', { name: 'Ages 18+' }))
        .toBeVisible(),
      expect.soft(rateChart.getByText('Sources: County Health')).toBeVisible(),
    ])
  })
})
