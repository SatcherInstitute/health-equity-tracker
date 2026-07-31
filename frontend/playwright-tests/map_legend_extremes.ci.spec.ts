import { expect, test } from './utils/fixtures'

// Extremes mode narrows the map to the highest and lowest geographies. The legend
// has to describe that subset, not the full dataset, or it enumerates a bucket per
// geography and stops matching what is drawn.
const SIZE_OF_HIGHEST_LOWEST_GEOS_RATES_LIST = 5
const MAX_ABSENCE_SWATCHES = 2

const CASES = [
  { name: 'Utah counties', mls: '1.hiv-3.49' },
  { name: 'national states', mls: '1.hiv-3.00' },
]

for (const { name, mls } of CASES) {
  test(`extremes legend stays scoped to the mapped geographies: ${name}`, async ({
    page,
  }) => {
    const url = `/exploredata?mls=${mls}&mlp=disparity&demo=race_and_ethnicity`
    const legend = page.locator('.legend-items-box').first()

    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await expect(legend).toBeVisible()
    const normalRows = (await legend.innerText()).split('\n').length

    await page.goto(`${url}&extremes=true`, { waitUntil: 'domcontentloaded' })
    await expect(legend).toBeVisible()
    await expect
      .poll(async () => (await legend.innerText()).split('\n').length)
      .toBeLessThanOrEqual(
        SIZE_OF_HIGHEST_LOWEST_GEOS_RATES_LIST * 2 + MAX_ABSENCE_SWATCHES,
      )

    const extremeRows = (await legend.innerText()).split('\n')
    expect(extremeRows.length).toBeGreaterThan(0)

    // A bucket whose ends carry the same label describes nothing; two-significant-
    // figure rate labels make distinct values collide unless they are collapsed.
    for (const row of extremeRows) {
      const ends = row.split('–').map((end) => end.trim())
      if (ends.length === 2) expect(ends[0]).not.toEqual(ends[1])
    }

    // Guards the regression itself: extremes previously produced a longer legend
    // than the unfiltered map because it enumerated every value in the dataset.
    expect(extremeRows.length).toBeLessThanOrEqual(normalRows + 1)
  })
}
