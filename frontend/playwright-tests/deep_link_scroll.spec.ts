import { expect, test } from './utils/fixtures'

// Position assertions run under reduced motion so they land on a settled page
// instead of racing the animation, which is what made this spec flaky under CI
// timing. The smooth branch gets its own block at the bottom of the file.
test.use({ reducedMotion: 'reduce' })

// Every test here loads a full report against the live dev backend. Run them in
// one worker: with fullyParallel they competed with each other, and a report
// slow enough to still be growing after the hook's 5s settle window leaves its
// card displaced for good, which read as flake rather than as the load being
// slow.
test.describe.configure({ mode: 'default' })

const REPORT = '/exploredata?mls=1.diabetes-3.13&demo=race_and_ethnicity'

// Where the card comes to rest is only deterministic once the report has stopped
// growing. The hook deliberately stops correcting after 5s so it never yanks a
// reader who has already started reading, which means a slow load can leave the
// card anywhere afterwards. So position is asserted only against a settled page
// (the menus below), and a deep link into a still-loading report asserts what
// holds at any load speed: it reaches the card and focus follows.
async function waitForStableHeight(page: any) {
  await expect
    .poll(
      async () => {
        const before = await page.evaluate(() => document.body.scrollHeight)
        await page.waitForTimeout(500)
        const after = await page.evaluate(() => document.body.scrollHeight)
        return before === after
      },
      { timeout: 30000, intervals: [500] },
    )
    .toBe(true)
}

for (const hashId of ['rate-chart', 'unknown-demographic-map']) {
  test(`deep link to #${hashId} reaches the card and focuses it`, async ({
    page,
  }) => {
    await page.goto(`${REPORT}#${hashId}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector(`#${hashId}`, { timeout: 30000 })

    // keyboard and screen reader users must arrive where sighted users do.
    // Focus is set once the scroll lands and nothing later moves it, so unlike
    // the resting position this holds however slowly the report loads.
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.id ?? ''), {
        timeout: 30000,
        intervals: [500],
      })
      .toBe(hashId)

    // a card this far down the report can only be reached by scrolling, so a
    // regression that dropped the scroll entirely would leave us at the top
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })
}

// The "on this page" menus share the same scroll mechanism but get their offset
// from CSS rather than the measured madlib header. A missing scroll-margin-top
// leaves the section under the app bar, which is invisible to a type check.
const MENU_PAGES = [
  '/methodology/data-sources',
  '/policy/gun-violence/data-collection',
]

for (const path of MENU_PAGES) {
  test(`on-this-page menu on ${path} lands clear of the app bar`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    const links = page
      .getByRole('navigation', { name: 'on this page quick navigation' })
      .first()
      .locator('ul button')
    await links.first().waitFor({ timeout: 30000 })
    await links.last().click()

    await expect
      .poll(
        async () => page.evaluate(() => document.activeElement?.id ?? ''),
        { timeout: 20000, intervals: [500] },
      )
      .not.toBe('')

    const { top, appBarBottom } = await page.evaluate(() => {
      const el = document.activeElement
      const bar = document.querySelector('.MuiAppBar-root')
      return {
        top: Math.round(el?.getBoundingClientRect().top ?? -1),
        appBarBottom: Math.round(bar?.getBoundingClientRect().bottom ?? 0),
      }
    })
    expect(top).toBeGreaterThanOrEqual(appBarBottom)
  })
}

// Methodology links into a report card from another page entirely, so the hash
// arrives through a react-router navigation rather than a fresh page load. The
// card is also lazy-loaded, which is what makes it worth asserting separately.
test('methodology link reaches the age-adjusted card', async ({ page }) => {
  await page.goto('/methodology/age-adjustment', {
    waitUntil: 'domcontentloaded',
  })
  const link = page.getByRole('link', { name: 'HIV deaths' }).first()
  await link.waitFor({ timeout: 30000 })
  await link.click()

  await page.waitForSelector('#age-adjusted-ratios', { timeout: 30000 })
  await expect(page).toHaveURL(/#age-adjusted-ratios/)

  await expect
    .poll(async () => page.evaluate(() => document.activeElement?.id ?? ''), {
      timeout: 30000,
      intervals: [500],
    })
    .toBe('age-adjusted-ratios')

  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})

// The mobile "jump to" dropdown is the only navigation surface with no desktop
// equivalent, and the one place a card can be offered that the report never
// rendered. The desktop sidebar reads the same list, so a divergence between the
// two is the regression to catch.
test.describe('mobile jump-to menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  async function openJumpTo(page: any) {
    await page.goto(REPORT, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#rate-chart', { timeout: 30000 })
    // a real user opens this menu after the report has drawn itself, and only a
    // settled page gives a deterministic landing position to assert against
    await waitForStableHeight(page)
    await page.locator('#jump-to-select').click()
    await page.waitForSelector('li[role="option"]', { timeout: 10000 })
  }

  test('offers exactly the cards the report rendered', async ({ page }) => {
    await openJumpTo(page)
    const labels = await page.locator('li[role="option"]').allInnerTexts()

    // diabetes in Georgia has no inequities-over-time data, so the card is
    // absent from the DOM and must be absent from the menu
    const inDom = await page.evaluate(
      () => document.getElementById('inequities-over-time') !== null,
    )
    expect(labels.includes('Inequities over time')).toBe(inDom)
    expect(labels.length).toBeGreaterThan(2)
  })

  for (const [label, hashId] of [
    ['Data table', 'data-table'],
    ['Definitions & missing data', 'definitions-missing-data'],
  ]) {
    test(`jumping to "${label}" focuses it clear of the app bar`, async ({
      page,
    }) => {
      await openJumpTo(page)
      await page.locator('li[role="option"]', { hasText: label }).click()

      // MUI restores focus to the select as its menu closes, so this also
      // asserts the scroll is deferred until after that happens
      await expect
        .poll(
          async () => page.evaluate(() => document.activeElement?.id ?? ''),
          { timeout: 20000, intervals: [500] },
        )
        .toBe(hashId)

      const { top, appBarBottom, viewportHeight } = await page.evaluate(
        (id: string) => {
          const el = document.getElementById(id)
          const bar = document.querySelector('.MuiAppBar-root')
          return {
            top: Math.round(el?.getBoundingClientRect().top ?? -1),
            appBarBottom: Math.round(bar?.getBoundingClientRect().bottom ?? 0),
            viewportHeight: window.innerHeight,
          }
        },
        hashId,
      )
      // the bug this catches is the card landing under the sticky app bar. How
      // far below it lands is the measured header offset, a runtime value, so
      // the only other bound worth asserting is that the card is on screen at
      // all: both of these cards sit far enough down the report that a dropped
      // scroll would leave them below the fold.
      expect(top).toBeGreaterThanOrEqual(appBarBottom)
      expect(top).toBeLessThan(viewportHeight)
    })
  }

  // The cards are focusable only so keyboard and screen reader users arrive
  // where sighted users do. Painting a ring for a tap tells nobody anything, so
  // the ring has to track how the jump was made, not that focus moved.
  test('paints a focus ring only when the jump came from the keyboard', async ({
    page,
  }) => {
    await openJumpTo(page)
    await page.locator('li[role="option"]', { hasText: 'Data table' }).click()
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.id ?? ''), {
        timeout: 20000,
        intervals: [500],
      })
      .toBe('data-table')
    expect(
      await page.evaluate(
        () => document.getElementById('data-table')?.matches(':focus-visible'),
      ),
    ).toBe(false)

    await page.goto(REPORT, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#data-table', { timeout: 30000 })
    await page.evaluate(() =>
      (document.getElementById('jump-to-select') as HTMLElement)?.focus(),
    )
    await page.keyboard.press('Enter')
    await page.waitForSelector('li[role="option"]', { timeout: 10000 })
    for (let i = 0; i < 12; i++) {
      const focused = await page.evaluate(
        () => document.activeElement?.textContent ?? '',
      )
      if (focused.includes('Data table')) break
      await page.keyboard.press('ArrowDown')
    }
    await page.keyboard.press('Enter')

    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.id ?? ''), {
        timeout: 20000,
        intervals: [500],
      })
      .toBe('data-table')
    expect(
      await page.evaluate(
        () => document.getElementById('data-table')?.matches(':focus-visible'),
      ),
    ).toBe(true)
  })
})

// Everything above skips the animation, so none of it reaches the branch most
// users actually get: the scrollend listener, its 1s Safari fallback, and the
// focus that only fires once one of the two resolves. A regression there would
// strand keyboard users at the top of the document with the viewport moved.
test.describe('smooth scrolling', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('deep link animates and still lands focus on the card', async ({
    page,
  }) => {
    const hashId = 'rate-chart'
    await page.goto(`${REPORT}#${hashId}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector(`#${hashId}`, { timeout: 30000 })

    // focus only lands once scrollend or its 1s fallback resolves, so this is
    // what proves the animated branch completed rather than stalling
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.id ?? ''), {
        timeout: 30000,
        intervals: [500],
      })
      .toBe(hashId)

    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })
})
