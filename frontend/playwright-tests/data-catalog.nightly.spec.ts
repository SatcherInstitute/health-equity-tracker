import { test, expect } from '@playwright/test';

test('Data Catalog Loads', async ({ page }) => {
    await page.goto('/datacatalog', { waitUntil: "commit" });
    await expect(page.getByRole('heading', { name: 'View and download Health Equity Tracker data sources', exact: true })).toBeVisible();
    // @ts-ignore
    await expect(page).toPassAxe()
});
