import { expect, test } from '@playwright/test'

test('PHRMA: Medicare AMI - Anchor & Scan', async ({ page }) => {
  // 1. SETUP: Block heavy assets & Kill Animations
  // Blocking fonts and SVGs significantly reduces layout thrashing
  await page.route('**/*.{png,jpg,jpeg,svg,woff,woff2}', (route) =>
    route.abort(),
  )

  // Inject CSS to disable animations/transitions for instant checks
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  })

  // 2. NAVIGATE
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.12&group1=85PLUS&dt1=medicare_ami&demo=age',
    { waitUntil: 'domcontentloaded' },
  )

  // --- SECTION 1: MAP INTERACTION ---
  // ANCHOR: We lock onto the map ID.
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    // SCAN: Fast text lookups scoped to the rateMap container where possible
    await Promise.all([
      // Top level headers (using role for uniqueness on common text)
      expect
        .soft(
          page.getByRole('heading', { name: 'Investigate rates of Medicare' }),
        )
        .toBeVisible(),

      // Scoped text checks (Fast)
      expect
        .soft(rateMap.getByText('Rates of Acute MI in Florida'))
        .toBeVisible(),
      expect
        .soft(
          page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
        )
        .toBeVisible(),

      // Using .first() on common text to avoid "strict mode" errors if it appears in hidden tooltips
      expect
        .soft(page.getByText('Total population of Medicare').first())
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

  // --- SECTION 2: RATE CHART ---
  // Interaction must remain sequential
  await page.getByRole('button', { name: 'Rate chart' }).click()

  // ANCHOR: Lock onto rate chart
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      // SCAN: Check contents inside the anchor
      expect
        .soft(rateChart.getByText('Rates of Acute MI in Florida'))
        .toBeVisible(),
      expect.soft(rateChart.getByText('Medicare Beneficiaries')).toBeVisible(),
    ])
  })

  // --- SECTION 3: POPULATION VS DISTRIBUTION ---
  // Clicks to switch views
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()

  // ANCHOR: Lock onto the specific container
  const popDist = page.locator('#population-vs-distribution')
  await popDist.scrollIntoViewIfNeeded()

  await test.step('Verify Pop vs Dist', async () => {
    await Promise.all([
      // "Share of beneficiary" might be in multiple charts, so we scope it or use Role
      expect
        .soft(page.getByRole('heading', { name: 'Share of beneficiary' }))
        .toBeVisible(),

      // Visual elements (Role is actually safer/faster than text for graphics)
      expect
        .soft(page.getByRole('img', { name: 'light green bars represent %' }))
        .toBeVisible(),
      expect
        .soft(page.getByRole('img', { name: 'dark green bars represent %' }))
        .toBeVisible(),

      // Text scan
      expect
        .soft(page.getByText('% of beneficiary pop. vs % of'))
        .toBeVisible(),
    ])
  })

  // --- SECTION 4: DATA TABLE ---
  await page.getByRole('button', { name: 'Data table' }).click()

  // We scroll to the summary header to ensure the table renders
  await page.getByText('Summary for acute myocardial').scrollIntoViewIfNeeded()

  await test.step('Verify Data Table', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Summary for acute myocardial' }),
        )
        .toBeVisible(),

      // "Age" is a very common word. Using Role here prevents finding "Age" in a paragraph.
      expect
        .soft(page.getByRole('columnheader', { name: 'Age' }))
        .toBeVisible(),

      // Long specific headers are safe for fast text lookup
      expect
        .soft(page.getByText('Medicare beneficiary acute MI'))
        .toBeVisible(),
      expect.soft(page.getByText('Share of all beneficiaries')).toBeVisible(),
    ])
  })
})
