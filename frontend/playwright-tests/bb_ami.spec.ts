import { expect, test } from '@playwright/test'

test('PHRMA: Beta Blockers after Heart Attack (AMI) - Fixed', async ({
  page,
}) => {
  // 1. SETUP: Block heavy assets & Kill Animations
  await page.route('**/*.{png,jpg,jpeg,svg,woff,woff2}', (route) =>
    route.abort(),
  )
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  })

  // 2. NAVIGATE
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All',
    {
      waitUntil: 'domcontentloaded',
    },
  )

  // --- INTERACTION ---
  // 1. Open the Category Menu
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Race/Ethnicity' })
    .click()

  // 2. Select 'Eligibility'
  await page.getByRole('menuitem', { name: 'Eligibility' }).click()

  // 3. Open the Sub-Menu
  await page.getByText('Medicare eligibility:').click()

  // 4. Select the specific Option
  await page
    .getByRole('button', { name: 'Eligible due to disability', exact: true })
    .click()

  // --- SECTION 1: RATE MAP ---
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

      // FIX: Reverted to getByRole('heading') to distinguish the title from the summary text
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

  // --- SECTION 2: RATE CHART ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(rateChart.getByText('Population Persistent to Beta'))
        .toBeVisible(),
    ])
  })

  // --- SECTION 3: UNKNOWN DEMOGRAPHIC MAP & TABLE ---
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

  // --- SECTION 4: DEFINITIONS ---
  await page.getByRole('button', { name: 'Definitions & missing data' }).click()

  await test.step('Verify Definitions', async () => {
    await Promise.all([
      expect
        .soft(page.getByText('Medication Utilization in the'))
        .toBeVisible(),
      // Use .first() to handle strict mode collisions
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
