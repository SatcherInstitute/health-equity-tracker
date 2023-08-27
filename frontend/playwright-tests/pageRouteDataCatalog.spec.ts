import { test, expect } from '@playwright/test';

test('Data Catalog Loads', async ({ page }) => {
    await page.goto('/faqs', { waitUntil: "networkidle" });
    await expect(page.getByRole('heading', { name: 'Data', exact: true })).toBeVisible();
    // @ts-ignore
    await expect(page).toPassAxe()
});
