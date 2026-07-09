import { expect, test } from './utils/fixtures'

test('PHRMA: Medicare AMI', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.12&group1=85PLUS&dt1=medicare_ami&demo=age',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Investigate rates of Medicare' }),
        )
        .toBeVisible(),
      expect
        .soft(rateMap.getByText('Rates of Acute MI in Florida'))
        .toBeVisible(),
      expect
        .soft(
          page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByText(
            'Acute Myocardial Infarctions (Heart Attacks): The number',
          ),
        )
        .toBeVisible(),
    ])
  })

  await page.getByRole('button', { name: 'Rate chart' }).click()

  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(rateChart.getByText('Rates of Acute MI in Florida'))
        .toBeVisible(),
      expect.soft(rateChart.getByText('Medicare Beneficiaries')).toBeVisible(),
    ])
  })

  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()

  const popDist = page.locator('#population-vs-distribution')
  await popDist.scrollIntoViewIfNeeded()

  await test.step('Verify Pop vs Dist', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Share of beneficiary' }))
        .toBeVisible(),
      expect
        .soft(page.getByRole('img', { name: 'light green bars represent %' }))
        .toBeVisible(),
      expect
        .soft(page.getByRole('img', { name: 'dark green bars represent %' }))
        .toBeVisible(),
      expect
        .soft(page.getByText('% of beneficiary pop. vs % of'))
        .toBeVisible(),
    ])
  })

  await page.getByRole('button', { name: 'Data table' }).click()
  await page.getByText('Summary for acute myocardial').scrollIntoViewIfNeeded()

  await test.step('Verify Data Table', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Summary for acute myocardial' }),
        )
        .toBeVisible(),
      expect
        .soft(page.getByRole('columnheader', { name: 'Age' }))
        .toBeVisible(),
      expect
        .soft(page.getByText('Medicare beneficiary acute MI'))
        .toBeVisible(),
      expect.soft(page.getByText('Share of all beneficiaries')).toBeVisible(),
    ])
  })
})
