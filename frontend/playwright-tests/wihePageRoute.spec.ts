import { test, expect } from '@playwright/test';

const WHAT_IS_HEALTH_EQUITY_PAGE_LINK = "/whatishealthequity";


test('WIHE Page Loads', async ({ page }) => {
    await page.goto(WHAT_IS_HEALTH_EQUITY_PAGE_LINK, { waitUntil: "networkidle" });
    // @ts-ignore   
    await expect(page).toPassAxe()
    await expect(page.getByRole('heading', { name: 'What is Health Equity?', exact: true })).toBeVisible();
});

