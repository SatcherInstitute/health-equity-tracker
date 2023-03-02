import { test, expect } from '@playwright/test';
const NEWS_TAB_LINK = "/news";

test('FAQ Tab Loads', async ({ page }) => {
    await page.goto(NEWS_TAB_LINK, { waitUntil: "networkidle" });
    await expect(page.getByRole('heading', { name: 'News and Stories', exact: true })).toBeVisible();
    // @ts-ignore
    await expect(page).toPassAxe()
});