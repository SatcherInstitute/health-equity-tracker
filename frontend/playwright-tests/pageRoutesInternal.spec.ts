import { test, expect } from '@playwright/test';

const ABOUT_US_PAGE_LINK = "/aboutus";
const TERMS_OF_USE_PAGE_LINK = "/termsofuse";

// TAB URLS
const RESOURCES_TAB_LINK = "/resources";
const METHODOLOGY_TAB_LINK = "/methodology";
const AGE_ADJUSTMENT_TAB_LINK = "/ageadjustment";
const CONTACT_TAB_LINK = "/contact";
const OURTEAM_TAB_LINK = "/ourteam";

test.describe.configure({ mode: 'parallel' });



test('Resources Tab Loads', async ({ page }) => {
    await page.goto(RESOURCES_TAB_LINK, { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Health Equity']);
    // @ts-ignore
    await expect(page).toPassAxe()
});


test('Methodology Tab Loads', async ({ page }) => {
    await page.goto(METHODOLOGY_TAB_LINK, { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Recommended citation (APA) for the Health Equity Tracker:']);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Age-Adjustment Tab Loads', async ({ page }) => {
    await page.goto(AGE_ADJUSTMENT_TAB_LINK, { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Calculating Age-Adjusted Ratios']);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('About Us Page / Project Tab Loads', async ({ page }) => {
    await page.goto(ABOUT_US_PAGE_LINK, { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're focused on equitable data.`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Our Team Tab Loads', async ({ page }) => {
    await page.goto(OURTEAM_TAB_LINK, { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're working towards a better tomorrow.`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Contact Tab Loads', async ({ page }) => {
    await page.goto(CONTACT_TAB_LINK, { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText([`Let's move`], { useInnerText: true });
    // @ts-ignore
    await expect(page).toPassAxe()
});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto(TERMS_OF_USE_PAGE_LINK, { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`Terms of Use`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});
