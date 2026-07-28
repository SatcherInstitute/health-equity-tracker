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
