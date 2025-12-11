import { expect, test } from '@playwright/test'

test('Beta Blockers Adherence - Anchor & Scan', async ({ page }) => {
  // 1. SETUP: Block heavy assets & Kill Animations
  await page.route('**/*.{png,jpg,jpeg,svg,woff,woff2}', (route) =>
    route.abort(),
  )
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  })

  // 2. NAVIGATE
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=beta_blockers_adherence',
    { waitUntil: 'domcontentloaded' },
  )

  // --- SECTION 1: TOP HEADER & MAP ---
  // ANCHOR: Lock onto map
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Initial Map State', async () => {
    await Promise.all([
      // SCAN: Fast text check
      expect
        .soft(rateMap.getByText('Population adherent to beta blockers'))
        .toBeVisible(),
      // "Off" button check
      expect
        .soft(page.getByText('Off').nth(1))
        .toBeVisible(),
    ])
  })

  // --- INTERACTION: CHANGE DATA TYPE ---
  // Click the "Off" toggle
  await page.getByText('Off').nth(1).click()

  // Open the Menu
  // Note: '#menu- div' is specific to your app structure.
  // If this becomes flaky, try locating by the visible label text of the dropdown.
  await page.locator('#menu- div').first().click()

  // Select the new data type
  await page
    .getByText('Adherence to beta blockers: Pharmacy Quality Alliance')
    .click()

  // --- SECTION 2: RATE CHART ---
  // ANCHOR: Lock onto chart
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart & Headers', async () => {
    await Promise.all([
      // SCAN: Check chart header
      expect
        .soft(rateChart.getByText('Population adherent to beta blockers'))
        .toBeVisible(),

      // Check summary headers (long text is safe for getByText)
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

  // --- SECTION 3: FOOTER & DEFINITIONS ---
  // Click to expand definitions (Assuming this div selector is the "Read More" or similar button)
  await page.locator('div:nth-child(8)').first().click()

  // Scroll to ensure visibility
  await page
    .getByRole('heading', { name: 'Definitions:' })
    .scrollIntoViewIfNeeded()

  await test.step('Verify Definitions', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('heading', { name: 'Definitions:' }))
        .toBeVisible(),
      // Exact match for the term being defined
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
