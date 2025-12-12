import { expect, test } from './utils/fixtures'

test('Asthma', async ({ page }) => {
  await page.goto('/exploredata?mls=1.asthma-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect.soft(page.getByText('Race/Ethnicity:')).toBeVisible(),
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'Asthma in the United States' }),
        )
        .toBeVisible(),
      expect.soft(page.getByLabel('open the topic info modal')).toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    // FIX: Added await to the single expect
    await expect
      .soft(
        rateChart.getByRole('heading', {
          name: 'Asthma in the United States',
        }),
      )
      .toBeVisible()
  })

  // --- Share & Population Section ---
  // FIX: Added scroll to ensure these elements are in the viewport
  await page
    .getByRole('heading', { name: 'Share of all adult asthma cases' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Share and Population Views', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', {
            name: 'Share of all adult asthma cases',
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

  // --- Summary Table Section ---
  await page
    .getByRole('heading', { name: 'Summary for asthma' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Summary Table', async () => {
    // FIX: Added await to the single expect
    await expect
      .soft(page.getByRole('heading', { name: 'Summary for asthma' }))
      .toBeVisible()
  })
})
