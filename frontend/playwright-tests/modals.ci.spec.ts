/**
 * CI-level smoke tests for URL-param-backed modals.
 *
 * These specifically guard the useParamState read/write contract:
 *   - pre-set URL param → modal visible on load (read path)
 *   - close button → param deleted from URL (false → delete write path)
 *
 * Nightly modals.spec.ts covers deeper interactions (back-button,
 * in-modal navigation, multimap content). Keep these fast and focused.
 */
import { expect, test } from './utils/fixtures'

const BASE_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison'

test('topic-info param opens modal on load; close removes param', async ({
  page,
}) => {
  await page.goto(`${BASE_URL}&topic-info=true`, {
    waitUntil: 'domcontentloaded',
  })

  // Modal should be visible immediately from the pre-set URL param
  await expect(page.getByRole('dialog')).toBeVisible()

  // Close and verify the param is removed
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

  // Multimap dialog should be open from the pre-set param
  await expect(page.getByRole('dialog')).toBeVisible()

  // Close and verify the param is removed
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page).not.toHaveURL(/multiple-maps=true/)
})
