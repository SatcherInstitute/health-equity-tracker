import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Data Catalog Loads', async ({ page }) => {
    await page.goto('/datacatalog', { waitUntil: "commit" });
    await expect(page.getByRole('heading', { name: 'View and download Health Equity Tracker data sources', exact: true })).toBeVisible();
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

});
