import { expect, test } from '@playwright/test'

test('Beta Blockers Adherence', async ({ page }) => {
  await page.route('**/*.{png,jpg,jpeg,svg,woff,woff2}', (route) =>
    route.abort(),
  )
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  })

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
    expect.soft(page.getByText('Off').nth(1)).toBeVisible(),
  ])

  await page.getByText('Off').nth(1).click()
  await page
    .getByRole('button', { name: 'Adherence to beta blockers', exact: false })
    .click()
  await page
    .getByText('Adherence to beta blockers: Pharmacy Quality Alliance')
    .click()

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
      expect
        .soft(page.getByRole('heading', { name: 'What data are missing?' }))
        .toBeVisible(),
      expect
        .soft(
          page.getByText(
            'Do you have information that belongs on the Health Equity Tracker?',
          ),
        )
        .toBeVisible(),
    ])
  })
})
