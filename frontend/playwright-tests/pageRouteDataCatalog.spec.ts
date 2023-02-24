import { test, expect } from '@playwright/test';
const FAQ_TAB_LINK = "/faqs";

test('Data Catalog Loads', async ({ page }) => {
    await page.goto(FAQ_TAB_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    await expect(page.getByRole('heading', { name: 'Data', exact: true })).toBeVisible();

});
