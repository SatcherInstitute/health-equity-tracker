import { expect, test } from './utils/fixtures'

// Verify that the transparent bounding-box rects over AK and HI insets are
// clickable — water + inter-island gaps count as hit area, not just land pixels.

test('Clicking Hawaii inset navigates to Hawaii state report', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await expect(rateMap).toBeVisible()
  await expect(rateMap.locator('svg path').first()).toBeVisible()

  await rateMap.locator('rect[data-fips="15"]').click()
  await expect(page).toHaveURL(/mls=1\.hiv-3\.15/)
})

test('Clicking Alaska inset navigates to Alaska state report', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await expect(rateMap).toBeVisible()
  await expect(rateMap.locator('svg path').first()).toBeVisible()

  await rateMap.locator('rect[data-fips="02"]').click()
  await expect(page).toHaveURL(/mls=1\.hiv-3\.02/)
})
