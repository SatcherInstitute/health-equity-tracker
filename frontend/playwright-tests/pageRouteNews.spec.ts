import { test, expect } from '@playwright/test';

test('News Tab Loads', async ({ page }) => {
    await page.goto('/news', { waitUntil: "networkidle" });
    await expect(page.getByRole('heading', { name: 'News and Stories', exact: true })).toBeVisible();
    // @ts-ignore
    await expect(page).toPassAxe()
});