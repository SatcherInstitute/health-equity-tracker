import { expect, test } from './utils/fixtures'

test('Beta Blockers Adherence', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=beta_blockers_adherence',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await Promise.all([
    expect
      .soft(
        rateMap.getByRole('heading', {
          name: 'Population adherent to beta blockers',
        }),
      )
      .toBeVisible(),
  ])

  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', {
            name: 'Population adherent to beta blockers',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByText('Adherent beneficiary population with unknown race'),
        )
        .toBeVisible(),
      expect
        .soft(page.getByText('Summary for adherence to beta blockers'))
        .toBeVisible(),
    ])
  })

  await page.getByRole('button', { name: 'Definitions & missing data' }).click()
  await page
    .getByRole('heading', { name: 'Definitions:' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Definitions', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Definitions:' }))
        .toBeVisible(),
      expect
        .soft(page.getByText('Adherence to beta blockers', { exact: true }))
        .toBeVisible(),
    ])
  })
})
