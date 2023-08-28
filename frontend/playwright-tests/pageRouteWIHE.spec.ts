import { test, expect } from '@playwright/test';

test('WIHE Page Loads', async ({ page }) => {
    await page.goto('/whatishealthequity', { waitUntil: "networkidle" });
    await expect(page.getByRole('heading', { name: 'What is Health Equity?', exact: true })).toBeVisible();
    // @ts-ignore
    await expect(page).toPassAxe()
});

