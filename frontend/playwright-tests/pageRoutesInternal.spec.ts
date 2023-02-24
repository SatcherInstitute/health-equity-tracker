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
    // @ts-ignore
    await expect(page).toPassAxe()
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Health Equity']);
});


test('Methodology Tab Loads', async ({ page }) => {
    await page.goto(METHODOLOGY_TAB_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Recommended citation (APA) for the Health Equity Tracker:']);
});

test('Age-Adjustment Tab Loads', async ({ page }) => {
    await page.goto(AGE_ADJUSTMENT_TAB_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Calculating Age-Adjusted Ratios']);
});

test('About Us Page / Project Tab Loads', async ({ page }) => {
    await page.goto(ABOUT_US_PAGE_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're focused on equitable data.`]);
});

test('Our Team Tab Loads', async ({ page }) => {
    await page.goto(OURTEAM_TAB_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're working towards a better tomorrow.`]);
});

test('Contact Tab Loads', async ({ page }) => {
    await page.goto(CONTACT_TAB_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText([`Let's move`], { useInnerText: true });
});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto(TERMS_OF_USE_PAGE_LINK, { waitUntil: "networkidle" });
    // @ts-ignore
    await expect(page).toPassAxe()
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`Terms of Use`]);
});
