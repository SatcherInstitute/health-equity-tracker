import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('FAQ Tab Loads', async ({ page }) => {
    await page.goto('/faqs', { waitUntil: "commit" });
    await expect(page.getByRole('heading', { name: 'Data', exact: true })).toBeVisible();
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

});