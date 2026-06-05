// Nightly-only (MOBILE_NIGHTLY / TABLET_NIGHTLY projects — not in E2E_CI).
// Below 600px HetResponsiveDialog renders a Drawer; at 600px+ it renders a Dialog.
import { expect, test } from './utils/fixtures'

const REPORT_URL =
  '/exploredata?mls=1.incarceration-3.00&group1=All&mlp=disparity&dt1=prison'

const PHONE = { width: 390, height: 844 }
const TABLET = { width: 768, height: 1024 }

test.describe('phone width (390px) — bottom-sheet drawers', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(PHONE)
  })

  test('report-insight opens as bottom-sheet; close button removes param', async ({
    page,
  }) => {
    await page.goto(`${REPORT_URL}&report-insight=true`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('close dialog').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).not.toHaveURL(/report-insight/)
  })

  test('report-insight bottom-sheet closes on Escape', async ({ page }) => {
    await page.goto(`${REPORT_URL}&report-insight=true`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).not.toHaveURL(/report-insight/)
  })

  test('topic-info opens as bottom-sheet; close button removes param', async ({
    page,
  }) => {
    await page.goto(`${REPORT_URL}&topic-info=true`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('close dialog').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).not.toHaveURL(/topic-info/)
  })

  test('chlp-maps opens as bottom-sheet; close button removes param', async ({
    page,
  }) => {
    await page.goto(`${REPORT_URL}&chlp-maps=true`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('close dialog').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).not.toHaveURL(/chlp-maps/)
  })

  test('multiple-maps opens as bottom-sheet; Close button removes param', async ({
    page,
  }) => {
    await page.goto(
      '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison&multiple-maps=true',
      { waitUntil: 'domcontentloaded' },
    )
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 20000 })
    await page.getByLabel('close dialog').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).not.toHaveURL(/multiple-maps=true/)
  })
})

test.describe('tablet width (768px) — standard dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(TABLET)
  })

  test('topic-info opens as dialog at tablet width; close button removes param', async ({
    page,
  }) => {
    await page.goto(`${REPORT_URL}&topic-info=true`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('close dialog').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).not.toHaveURL(/topic-info/)
  })

  test('chlp-maps opens as dialog at tablet width; close button removes param', async ({
    page,
  }) => {
    await page.goto(`${REPORT_URL}&chlp-maps=true`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('close dialog').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).not.toHaveURL(/chlp-maps/)
  })
})
