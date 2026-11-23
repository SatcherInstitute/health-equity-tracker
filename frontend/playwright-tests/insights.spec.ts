// Nightly-only: covers the three insight surfaces (card, contrast, report)
// and the flag control. Insights are unconditional since the gate came out, so
// these run on every environment as-is. The flag control test mocks the report
// request, since a real one deletes the cached key and writes a record to the
// flagged bucket that fails the weekly flagged-insights cron.
import { expect, test } from './utils/fixtures'

const DISPARITY_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison'

const COMPARE_URL =
  '/exploredata?mls=1.incarceration-3.poverty-5.00&group1=All&mlp=comparevars&dt1=prison'

const REPORT_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison&report-insight=true'

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
  await expect(card).toContainText('AI-generated. Click to report a harmful or inaccurate insight, or learn more.')
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
  await expect(contrastCard).toContainText('AI-generated. Click to report a harmful or inaccurate insight, or learn more.')
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
    page.getByText('AI-generated. Click to report a harmful or inaccurate insight, or learn more.'),
  ).toBeVisible()
})

// --- Flag control ---

test('flag control — dialog opens, reason enables submit, dialog closes on submission', async ({
  page,
}) => {
  let flagReason: string | undefined
  await page.route('**/flag-insight', async (route) => {
    flagReason = route.request().postDataJSON().reason
    await route.fulfill({ status: 200, body: '{}' })
  })

  await page.goto(DISPARITY_URL, { waitUntil: 'domcontentloaded' })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()
  await rateMap.getByLabel('Generate insight').click()

  const card = page.locator('div[role="status"]').first()
  await expect(card).toBeVisible({ timeout: 30_000 })

  // The disclosure line is itself the trigger since #5220 folded reporting into
  // the transparency dialog.
  await card
    .getByRole('button', { name: /AI-generated\. Click to report/ })
    .click()

  // Submit is disabled until a reason is chosen.
  const submit = page.getByRole('button', { name: 'Submit report' })
  await expect(submit).toBeDisabled()

  await page.getByLabel('Inaccurate').click()
  await expect(submit).toBeEnabled()

  await submit.click()

  // The dialog closes after a successful submission.
  await expect(submit).toBeHidden({ timeout: 10_000 })
  expect(flagReason).toBe('inaccurate')
})
