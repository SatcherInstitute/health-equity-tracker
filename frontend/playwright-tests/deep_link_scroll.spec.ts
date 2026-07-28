import { expect, test } from './utils/fixtures'

// Deep links land on a card whose position keeps moving while the report loads.
// These assert the page settles ON the card rather than near it, which is the
// failure mode that a scroll correction regression would reintroduce.

const REPORT = '/exploredata?mls=1.diabetes-3.13&demo=race_and_ethnicity'

async function probe(page: any, hashId: string) {
  return page.evaluate((id: string) => {
    const card = document.getElementById(id)
    if (!card) return null
    const header = document.getElementById('madlib-container')
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight
    return {
      cardTop: Math.round(card.getBoundingClientRect().top),
      headerBottom: header
        ? Math.round(header.getBoundingClientRect().bottom)
        : 0,
      focusedId: document.activeElement?.id ?? '',
      atMaxScroll: Math.abs(window.scrollY - maxScroll) < 3,
    }
  }, hashId)
}

for (const hashId of ['rate-chart', 'unknown-demographic-map']) {
  test(`deep link to #${hashId} settles on the card`, async ({ page }) => {
    await page.goto(`${REPORT}#${hashId}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector(`#${hashId}`, { timeout: 30000 })

    await expect
      .poll(
        async () => {
          const g = await probe(page, hashId)
          if (!g) return null
          // a card near the end of the report cannot reach the top of the
          // viewport, so bottoming out the scroll is the correct outcome there
          if (g.atMaxScroll) return 'settled'
          return Math.abs(g.cardTop - g.headerBottom) <= 40 ? 'settled' : 'moving'
        },
        { timeout: 30000, intervals: [1000] },
      )
      .toBe('settled')

    const settled = await probe(page, hashId)
    // keyboard and screen reader users must arrive where sighted users do
    expect(settled.focusedId).toBe(hashId)
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
        async () => {
          const focusedId = await page.evaluate(
            () => document.activeElement?.id ?? '',
          )
          if (!focusedId) return 'no focus'
          const { top, appBarBottom } = await page.evaluate((id: string) => {
            const el = document.getElementById(id)
            const bar = document.querySelector('.MuiAppBar-root')
            return {
              top: Math.round(el?.getBoundingClientRect().top ?? -1),
              appBarBottom: Math.round(bar?.getBoundingClientRect().bottom ?? 0),
            }
          }, focusedId)
          return top >= appBarBottom ? 'clear' : `occluded by ${appBarBottom - top}px`
        },
        { timeout: 20000, intervals: [500] },
      )
      .toBe('clear')
  })
}
