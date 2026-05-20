/**
 * CI-level smoke tests for URL-param-backed modals.
 *
 * These guard the useParamState read/write contract:
 *   - pre-set URL param → modal visible on load (read path)
 *   - close → param deleted from URL (false → delete write path)
 *
 * Deeper interactions (back-button, in-modal navigation, multimap
 * content) live in nightly modals.spec.ts. Keep these fast and focused.
 */
import { expect, test } from './utils/fixtures'

const REPORT_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison'

test('topic-info param opens modal on load; close removes param', async ({
  page,
}) => {
  await page.goto(`${REPORT_URL}&topic-info=true`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('close topic info modal').click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page).not.toHaveURL(/topic-info/)
})

test('multiple-maps param opens multimap on load; close removes param', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison&multiple-maps=true',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page).not.toHaveURL(/multiple-maps=true/)
})

test('chlp-maps param opens modal on load; close removes param', async ({
  page,
}) => {
  await page.goto(`${REPORT_URL}&chlp-maps=true`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('close modal').click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page).not.toHaveURL(/chlp-maps/)
})

test('report-insight param opens modal on load; Escape removes param', async ({
  page,
}) => {
  // InsightReportModal only renders on mobile layouts
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${REPORT_URL}&report-insight=true`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page).not.toHaveURL(/report-insight/)
})
