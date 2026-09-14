import { expect, test } from './utils/fixtures'

// Verify that transparent bounding-box rects extend the pointer hit area into
// coastal water so clicking water near AK/HI still navigates to the correct
// state report.

test('Clicking Hawaii inset rect navigates to Hawaii state report', async ({
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

test('Clicking Alaska inset rect navigates to Alaska state report', async ({
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
