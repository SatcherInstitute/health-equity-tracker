import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('Resources Tab Loads', async ({ page }) => {
    await page.goto('/resources', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Health Equity']);
    // @ts-ignore
    await expect(page).toPassAxe()
});


test('Methodology Tab Loads', async ({ page }) => {
    await page.goto('/methodology/recommended-citation', { waitUntil: "commit" });
    const mainHeading = page.locator('#recommended-citation');
    await expect(mainHeading).toHaveText(['Recommended citation (APA) for the Health Equity Tracker:']);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Age-Adjustment Tab Loads', async ({ page }) => {
    await page.goto('methodology/ageadjustment', { waitUntil: "commit" });
    const mainHeading = page.locator('#age-adjusted-ratios');
    await expect(mainHeading).toHaveText(['Calculating Age-Adjusted Ratios']);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('About Us Page / Project Tab Loads', async ({ page }) => {
    await page.goto('/aboutus', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're focused on equitable data.`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Our Team Tab Loads', async ({ page }) => {
    await page.goto('/ourteam', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're working towards a better tomorrow.`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Contact Tab Loads', async ({ page }) => {
    await page.goto('/contact', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText([`Let's move`], { useInnerText: true });
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
