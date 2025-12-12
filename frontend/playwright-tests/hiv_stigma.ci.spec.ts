import { expect, test } from './utils/fixtures'

test('HIV Stigma', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_stigma-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map & Time Chart Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map & Time Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'HIV stigma in the United' }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Rates of HIV stigma over time' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', { name: 'HIV stigma in the United' }),
        )
        .toBeVisible(),
    ])
  })

  // --- Missing Data / Footer Section ---
  await test.step('Verify Missing Data & Footer', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Stigma scores with unknown' }))
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Graph unavailable: Population' }),
        )
        .toBeVisible(),
    ])
  })
})
