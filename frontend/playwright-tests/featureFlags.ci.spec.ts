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
  // devtools to find out what is armed. Opening also logs, so the tooltip can
  // report the console table as already written rather than asking for a second
  // interaction — which means the listener has to be armed before the hover.
  const tablePayload = page.waitForEvent(
    'console',
    (msg) => msg.type() === 'table',
  )
  await indicator.hover()
  await expect(page.getByRole('tooltip')).toContainText(
    'VITE_SHOW_NOT_A_REAL_FLAG (param)',
  )
  const handle = (await tablePayload).args()[0]
  expect(await handle.jsonValue()).toMatchObject({
    VITE_SHOW_NOT_A_REAL_FLAG: { on: true, source: 'param' },
  })

  // Moving off dismisses it; a tooltip that outlives the pointer would sit on top
  // of the report.
  await page.getByRole('heading', { level: 1 }).first().hover()
  await expect(page.getByRole('tooltip')).toHaveCount(0)
})

// The whole reason this is an MUI tooltip rather than a title attribute: a touch
// device never fires hover, so the flag list had no way to surface on mobile.
test.describe('on a touch device', () => {
  test.use({ hasTouch: true })

  test('tapping opens the flag list, and tapping away dismisses it', async ({
    page,
  }) => {
    await page.goto('/exploredata?mls=1.hiv-3.00&VITE_SHOW_NOT_A_REAL_FLAG=1')

    await page.getByRole('button', { name: /active feature flags/ }).tap()
    await expect(page.getByRole('tooltip')).toContainText(
      'VITE_SHOW_NOT_A_REAL_FLAG (param)',
    )

    // Nothing about a touch device ever fires mouseleave, so without a click-away
    // the tooltip would stay pinned over the report for the rest of the session.
    await page.getByRole('heading', { level: 1 }).first().tap()
    await expect(page.getByRole('tooltip')).toHaveCount(0)
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
