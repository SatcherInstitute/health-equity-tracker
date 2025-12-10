import { test } from '@playwright/test'

test('Gun Homicide Test: County Data Suppressed', async ({ page }) => {
  await page.goto('/exploredata?mls=1.gun_violence-3.01&group1=All')
  await page.locator('#rate-map').getByText('Data suppressed').click()
})
