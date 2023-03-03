import { test, expect } from '@playwright/test';
const NEWS_TAB_LINK = "/news";

test('News Tab Loads', async ({ page }) => {
    await page.goto(NEWS_TAB_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    await expect(page.getByRole('heading', { name: 'News and Stories', exact: true })).toBeVisible();
});