import { expect, test } from './utils/fixtures'

test('Gun Homicide Test: County Data Suppressed', async ({ page }) => {
  await page.goto('/exploredata?mls=1.gun_violence-3.01&group1=All')
  await expect(page.getByText('Data Suppression')).toBeVisible()
})
