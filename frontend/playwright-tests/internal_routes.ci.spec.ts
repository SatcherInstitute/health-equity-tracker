import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });


test('Methodology Page Loads', async ({ page }) => {
    // TODO: update this route once we switch over to newer methodology version
    await page.goto('/new-methodology', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Methodology Introduction']);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Age-Adjustment Tab Loads', async ({ page }) => {
    await page.goto('/ageadjustment', { waitUntil: "commit" });
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('About Us Page Loads', async ({ page }) => {
    await page.goto('/aboutus', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`About the Health Equity Tracker`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto('/termsofuse', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`Terms of Use`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});
