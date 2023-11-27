import { test as setup } from '@playwright/test'

const authFile = 'playwright/.auth/user.json';

setup('Basic Auth Login', async ({ page }) => {
  await page.goto(
    'https://MSM:devsite@dev.healthequitytracker.org'
  )
  // await page.waitForURL('https://dev.healthequitytracker.org');
  await page.context().storageState({ path: authFile });

  // ensure log in worked and page is visible
  await page.getByRole('link', { name: 'Health Equity Tracker', exact: true }).click();

})
