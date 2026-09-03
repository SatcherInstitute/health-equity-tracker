import { expect, test } from '@playwright/test'

// The indicator exists so a flagged environment is never silently flagged. These
// run in a real browser because the arming happens at module scope against
// sessionStorage and window.location, which the unit tests only simulate.
// Every non-prod env turns at least one flag on, so the indicator is normally
// present here. Forcing both known flags off is the only way to reach the empty
// state, and it doubles as proof that an override beats an env-on flag.
test('no indicator once every flag is forced off', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&VITE_SHOW_INSIGHT_GENERATION=0&VITE_SHOW_CORRELATION_CARD=0',
  )
  await expect(
    page.getByRole('button', { name: /active feature flags/ }),
  ).toHaveCount(0)
})

test('a URL param arms an undeclared flag and shows the indicator', async ({
  page,
}) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&VITE_SHOW_NOT_A_REAL_FLAG=1')

  const indicator = page.getByRole('button', { name: /active feature flags/ })
  await expect(indicator).toBeVisible()

  // The param is stripped, since setMadLibWithParam would drop it on the first
  // mode change anyway and the URL would then stop describing the state.
  await expect(page).toHaveURL(/mls=1\.hiv-3\.00/)
  await expect(page).not.toHaveURL(/VITE_SHOW_NOT_A_REAL_FLAG/)

  // The tooltip names the flags outright, so a reviewer does not have to open
  // devtools to find out what is armed.
  await expect(indicator).toHaveAttribute(
    'title',
    /VITE_SHOW_NOT_A_REAL_FLAG \(param\)/,
  )

  const tablePayload = page.waitForEvent('console', (msg) => msg.type() === 'table')
  await indicator.click()
  const handle = (await tablePayload).args()[0]
  expect(await handle.jsonValue()).toMatchObject({
    VITE_SHOW_NOT_A_REAL_FLAG: { on: true, source: 'param' },
  })
})

test('the override survives a report change that rewrites the query', async ({
  page,
}) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&VITE_SHOW_NOT_A_REAL_FLAG=1')
  await expect(
    page.getByRole('button', { name: /active feature flags/ }),
  ).toBeVisible()

  await page.goto('/exploredata?mls=1.diabetes-3.00')
  await expect(
    page.getByRole('button', { name: /active feature flags/ }),
  ).toBeVisible()
})
