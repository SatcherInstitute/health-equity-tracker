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
  '/exploredata?mls=1.incarceration-3.poverty-5.00&group1=All&mlp=comparevars&dt1=prison&VITE_SHOW_INSIGHT_GENERATION=1'

const REPORT_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison&report-insight=true&VITE_SHOW_INSIGHT_GENERATION=1'

// --- Card insight ---

test('card insight — text, disclosure, and highlight on incarceration report', async ({
  page,
}) => {
  await page.goto(DISPARITY_URL, { waitUntil: 'domcontentloaded' })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()
  await rateMap.getByLabel('Generate insight').click()

  const card = page.locator('div[role="status"]').first()
  await expect(card).toBeVisible({ timeout: 30_000 })

  const text = await card.locator('[data-testid="insight-text"]').textContent()
  expect(text?.trim().length).toBeGreaterThan(0)
  await expect(card).toContainText('AI-generated. Verify with chart data.')
  await expect(card.locator('[data-testid="insight-highlight"]')).toBeVisible()
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

  const text = await contrastCard.locator('[data-testid="insight-text"]').textContent()
  expect(text?.trim().length).toBeGreaterThan(0)
  await expect(contrastCard).toContainText('AI-generated. Verify with chart data.')
  await expect(
    contrastCard.locator('[data-testid="insight-highlight"]'),
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

  // Each section label renders as an uppercase span inside the region with
  // non-empty text content below it.
  for (const label of [
    'Key Findings',
    'Location Comparison',
    'Demographic Insights',
    'What This Means',
  ]) {
    const sectionLabel = reportRegion.getByText(label, { exact: false })
    await expect(sectionLabel).toBeVisible()
    // Assert this section has rendered text content (not just a label).
    const sectionContent = sectionLabel.locator('..').locator('p')
    const contentText = await sectionContent.textContent()
    expect(contentText?.trim().length).toBeGreaterThan(0)
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
  await rateMap.getByLabel('Generate insight').click()

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
