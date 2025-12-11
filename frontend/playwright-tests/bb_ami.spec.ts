import { expect, test } from './utils/fixtures'

test('PHRMA: Beta Blockers after Heart Attack (AMI)', async ({ page }) => {
  await page.route('**/*.{png,jpg,jpeg,svg,woff,woff2}', (route) =>
    route.abort(),
  )
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  })

  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All',
    { waitUntil: 'domcontentloaded' },
  )

  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Race/Ethnicity' })
    .click()
  await page.getByRole('menuitem', { name: 'Eligibility' }).click()
  await page.getByText('Medicare eligibility:').click()
  await page
    .getByRole('button', { name: 'Eligible due to disability', exact: true })
    .click()

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Map', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', {
            name: 'Population Persistent to Beta',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', {
            name: 'Medicare Beta-Blocker Beneficiaries, Eligible due to disability, Ages 18+',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          page
            .locator('li')
            .filter({ hasText: 'Total population of Medicare Beta-Blocker' })
            .first(),
        )
        .toBeVisible(),
    ])
  })

  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(rateChart.getByText('Population Persistent to Beta'))
        .toBeVisible(),
    ])
  })

  await page.getByRole('button', { name: 'Unknown demographic map' }).click()

  await test.step('Verify Unknown Map & Table Headers', async () => {
    await Promise.all([
      expect.soft(page.getByText('No unknown values for')).toBeVisible(),
      expect
        .soft(page.getByRole('columnheader', { name: 'Medicare eligibility' }))
        .toBeVisible(),
      expect
        .soft(page.getByRole('columnheader', { name: '% of pop. receiving' }))
        .toBeVisible(),
    ])
  })

  await page.getByRole('button', { name: 'Definitions & missing data' }).click()

  await test.step('Verify Definitions', async () => {
    await Promise.all([
      expect
        .soft(page.getByText('Medication Utilization in the'))
        .toBeVisible(),
      expect
        .soft(
          page
            .getByText('Population Receiving Persistent Beta Blocker Treatment')
            .first(),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByText(
            'Measurement Definition: National Quality Forum measure',
          ),
        )
        .toBeVisible(),
      expect
        .soft(
          page
            .getByText('Clinical Importance: Beta-blockers are recommended')
            .first(),
        )
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('heading', { name: 'Medicare Administration Data' }),
        )
        .toBeVisible(),
      expect.soft(page.getByText('Disability: Although')).toBeVisible(),
    ])
  })
})
