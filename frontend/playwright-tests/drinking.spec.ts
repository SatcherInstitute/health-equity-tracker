import { expect, test } from './utils/fixtures'

test('Excessive Drinking: Rate Map and Extremes', async ({ page }) => {
  await page.goto('/exploredata?mls=1.excessive_drinking-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Map', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', {
            name: 'Excessive drinking cases in the United States',
          }),
        )
        .toBeVisible({ timeout: 20000 }),
      expect
        .soft(rateMap.getByRole('img').first())
        .toBeVisible({ timeout: 20000 }),
    ])
  })

  await test.step('Verify Extremes Panel', async () => {
    const expandBtn = rateMap.getByRole('button', {
      name: /Expand state\/territory rate extremes/i,
    })
    await expect.soft(expandBtn).toBeVisible({ timeout: 20000 })
    await expandBtn.click()
    await Promise.all([
      expect
        .soft(rateMap.getByRole('heading', { name: 'Highest:' }))
        .toBeVisible({ timeout: 10000 }),
      expect
        .soft(rateMap.getByRole('heading', { name: 'Lowest:' }))
        .toBeVisible(),
      expect
        .soft(rateMap.getByRole('heading', { name: 'National overall:' }))
        .toBeVisible(),
      expect
        .soft(rateMap.getByText('Consider the possible impact'))
        .toBeVisible(),
    ])
  })
})

test('Excessive Drinking: Rate Chart and Summary Table', async ({ page }) => {
  await page.goto('/exploredata?mls=1.excessive_drinking-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await expect
      .soft(
        rateChart.getByRole('heading', {
          name: 'Excessive drinking cases in the United States',
        }),
      )
      .toBeVisible({ timeout: 20000 })
  })

  const popVsDist = page.locator('#population-vs-distribution')
  await popVsDist.scrollIntoViewIfNeeded()

  await test.step('Verify Population vs Distribution', async () => {
    await expect
      .soft(
        popVsDist.getByRole('heading', {
          name: /Population vs\. distribution/i,
        }),
      )
      .toBeVisible({ timeout: 20000 })
  })

  const dataTable = page.locator('#data-table')
  await dataTable.scrollIntoViewIfNeeded()

  await test.step('Verify Summary Table Columns', async () => {
    await Promise.all([
      expect
        .soft(dataTable.getByRole('columnheader', { name: 'Race/Ethnicity' }))
        .toBeVisible({ timeout: 15000 }),
      expect
        .soft(
          dataTable.getByRole('columnheader', {
            name: 'Excessive drinking rate',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          dataTable.getByRole('columnheader', {
            name: /Share of all adult excessive drinking cases/i,
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          dataTable.getByRole('columnheader', { name: 'Population share' }),
        )
        .toBeVisible(),
    ])
  })
})
