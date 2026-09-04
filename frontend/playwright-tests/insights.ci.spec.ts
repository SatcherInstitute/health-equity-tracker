// CI-level spec: asserts that an AI insight actually renders — text appears,
// the disclosure line is present, and the highlighted phrase is in the text.
// Runs on every PR push via E2E_CI (Chromium only).
//
// The feature flag is armed as a URL param so CI's vite-preview build (which
// never sets VITE_SHOW_INSIGHT_GENERATION in its env) still exercises the full
// insight path for this one tab.
//
// The test targets incarceration by race, a stable view on the dev backend. If
// the insight is not yet in cache, generation runs once and caches it. If quota
// is exhausted that run, the test fails loudly — which is the correct signal.
import { expect, test } from './utils/fixtures'

const INSIGHT_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison&VITE_SHOW_INSIGHT_GENERATION=1'

test('card insight renders text, disclosure, and highlight', async ({
  page,
}) => {
  await page.goto(INSIGHT_URL, { waitUntil: 'domcontentloaded' })

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await page.getByLabel('Generate insight').first().click()

  // The status div is the insight container. Its absence is the silent failure
  // this test exists to catch, so there is no isVisible guard here.
  const insightCard = page.locator('div[role="status"]').first()
  await expect(insightCard).toBeVisible({ timeout: 30_000 })

  // Text must be non-empty — a silently empty section is the failure mode.
  const text = await insightCard.locator('p.font-bold').textContent()
  expect(text?.trim().length).toBeGreaterThan(0)

  // Disclosure line must appear exactly as written in the component.
  await expect(insightCard).toContainText('AI-generated. Verify with chart data.')

  // The highlighted phrase renders as a green span inside the bold text.
  await expect(
    insightCard.locator('span.font-semibold.text-dark-green'),
  ).toBeVisible()
})
