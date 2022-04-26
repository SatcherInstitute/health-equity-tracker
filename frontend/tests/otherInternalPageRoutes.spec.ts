import { test, expect } from '@playwright/test';

export const EXPLORE_DATA_PAGE_LINK = "/exploredata";
export const DATA_CATALOG_PAGE_LINK = "/datacatalog";
export const ABOUT_US_PAGE_LINK = "/aboutus";
export const WHAT_IS_HEALTH_EQUITY_PAGE_LINK = "/whatishealthequity";
export const TERMS_OF_USE_PAGE_LINK = "/termsofuse";

// TAB URLS
export const FAQ_TAB_LINK = "/faqs";
export const RESOURCES_TAB_LINK = "/resources";
export const METHODOLOGY_TAB_LINK = "/methodology";
export const AGE_ADJUSTMENT_TAB_LINK = "/ageadjustment";
export const DATA_TAB_LINK = "/datacatalog";
export const CONTACT_TAB_LINK = "/contact";
export const OURTEAM_TAB_LINK = "/ourteam";
export const NEWS_TAB_LINK = "/news";

test('WIHE Page Loads', async ({ page }) => {

    await page.goto(WHAT_IS_HEALTH_EQUITY_PAGE_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['What is Health Equity?']);
});


test('FAQ Tab Loads', async ({ page }) => {
    await page.goto(FAQ_TAB_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Data']);
});

test('News Tab Loads', async ({ page }) => {
    await page.goto(NEWS_TAB_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['News and Stories']);
});

test('Resources Tab Loads', async ({ page }) => {
    await page.goto(RESOURCES_TAB_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Resources']);
});


test('Data Catalog Page Loads', async ({ page }) => {
    await page.goto(DATA_TAB_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['View and download Health Equity Tracker data sources']);
});


test('Methodology Tab Loads', async ({ page }) => {
    await page.goto(METHODOLOGY_TAB_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Recommended Citation (APA) for the Health Equity Tracker:']);
});


test('About Us Page / Project Tab Loads', async ({ page }) => {
    await page.goto(ABOUT_US_PAGE_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're focused on equitable data.`]);
});

test('Our Team Tab Loads', async ({ page }) => {
    await page.goto(OURTEAM_TAB_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're working towards a better tomorrow.`]);
});

test('Contact Tab Loads', async ({ page }) => {
    await page.goto(CONTACT_TAB_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText([`Let's`, `move`, `equity`, `forward`]);
});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto(TERMS_OF_USE_PAGE_LINK);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`Terms of Use`]);
});