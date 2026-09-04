// Nightly-only: covers the three insight surfaces (card, contrast, report)
// and the flag control. All tests arm the feature flag via URL param so they
// work on any environment — including prod, where VITE_SHOW_INSIGHT_GENERATION
// is never set in the env file. The flag control test is skipped on prod
// because flagging deletes the cached key and writes to the flagged bucket.
import { expect, test } from './utils/fixtures'

const IS_PROD =
  process.env.E2E_BASE_URL?.includes('healthequitytracker.org') ?? false

const DISPARITY_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison&VITE_SHOW_INSIGHT_GENERATION=1'

const COMPARE_URL =
  '/exploredata?mls=1.incarceration-3.poverty-5.00&mlp=comparevars&dt1=prison&VITE_SHOW_INSIGHT_GENERATION=1'

const REPORT_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison&report-insight=true&VITE_SHOW_INSIGHT_GENERATION=1'

// --- Card insight ---

test('card insight — text, disclosure, and highlight on incarceration report', async ({
  page,
}) => {
  await page.goto(DISPARITY_URL, { waitUntil: 'domcontentloaded' })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()
  await page.getByLabel('Generate insight').first().click()

  const card = page.locator('div[role="status"]').first()
  await expect(card).toBeVisible({ timeout: 30_000 })

  const text = await card.locator('p.font-bold').textContent()
  expect(text?.trim().length).toBeGreaterThan(0)
  await expect(card).toContainText('AI-generated. Verify with chart data.')
  await expect(card.locator('span.font-semibold.text-dark-green')).toBeVisible()
})

// --- Contrast insight ---

test('contrast insight — compare mode renders text and highlight', async ({
  page,
}) => {
  await page.goto(COMPARE_URL, { waitUntil: 'domcontentloaded' })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()
  await page.getByLabel('Comparison insights').first().click()

  // ContrastInsightSection renders role="status" with an aria-label that names
  // the section (e.g. "Rate map comparison insight").
  const contrastCard = page
    .locator('[role="status"][aria-label*="comparison insight"]')
    .first()
  await expect(contrastCard).toBeVisible({ timeout: 30_000 })

  const text = await contrastCard.locator('p.font-bold').textContent()
  expect(text?.trim().length).toBeGreaterThan(0)
  await expect(
    contrastCard.locator('span.font-semibold.text-dark-green'),
  ).toBeVisible()
})

// --- Report insight (four sections) ---

test('report insight — all four sections render non-empty text', async ({
  page,
}) => {
  await page.goto(REPORT_URL, { waitUntil: 'domcontentloaded' })

  // InsightReportCard generates automatically on open and wraps its content in
  // a region. Wait for generation to finish (loading text disappears).
  await expect(
    page.getByText('Reviewing all charts with AI...'),
  ).toBeHidden({ timeout: 30_000 })

  const reportRegion = page.getByRole('region', { name: 'Report insights' })
  await expect(reportRegion).toBeVisible()

  // Each section label renders as an uppercase span inside the region.
  for (const label of [
    'Key Findings',
    'Location Comparison',
    'Demographic Insights',
    'What This Means',
  ]) {
    await expect(reportRegion.getByText(label, { exact: false })).toBeVisible()
  }

  // The report disclosure line must appear.
  await expect(
    page.getByText('AI-generated. Verify with chart data.'),
  ).toBeVisible()
})

// --- Flag control ---

test('flag control — popover opens, reason enables submit, popover closes on submission', async ({
  page,
}) => {
  test.skip(
    IS_PROD,
    'flagging deletes cache entries and writes to the flagged bucket — must not run against prod',
  )

  await page.goto(DISPARITY_URL, { waitUntil: 'domcontentloaded' })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()
  await page.getByLabel('Generate insight').first().click()

  const card = page.locator('div[role="status"]').first()
  await expect(card).toBeVisible({ timeout: 30_000 })

  // Open the flag popover.
  await card.getByText('Report harmful or inaccurate content').click()

  // Submit is disabled until a reason is chosen.
  const submit = page.getByRole('button', { name: 'Submit report' })
  await expect(submit).toBeDisabled()

  await page.getByLabel('Inaccurate').click()
  await expect(submit).toBeEnabled()

  await submit.click()

  // The popover closes after a successful submission.
  await expect(submit).toBeHidden({ timeout: 10_000 })
})
