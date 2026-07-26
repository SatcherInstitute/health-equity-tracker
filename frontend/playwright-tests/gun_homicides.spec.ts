import { expect, test } from './utils/fixtures'

test('Gun Homicide Test: County Data Suppressed', async ({ page }) => {
  await page.goto('/exploredata?mls=1.gun_violence-3.01&group1=All')
  await expect(page.getByText('Data Suppression')).toBeVisible()
})

test('Gun Homicide Test: suppressed counties are drawn and named as suppressed', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.gun_violence-3.01&dt1=gun_violence_homicide&group1=All',
  )
  // a suppressed county must still be rendered rather than dropped from the map,
  // and must say why it is blank instead of claiming the data simply does not exist
  await expect
    .poll(() => page.locator('path[aria-label*="Data suppressed"]').count(), {
      timeout: 30000,
    })
    .toBeGreaterThan(0)
  await expect(page.getByText('Data suppressed').first()).toBeVisible()
})
