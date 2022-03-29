import { test, expect } from '@playwright/test';

const HET = `http://localhost:3000/`
const EXPLOREDATA = `exploredata/`
const WIHE = `whatishealthequity/`
const FAQS = `faqs/`
const NEWS = `news/`
const RESOURCES = `resources/`
const DATA = `datacatalog/`
const ABOUTUS = `aboutus/`
const METHODOLOGY = `methodology/`
const OURTEAM = `ourteam/`
const CONTACT = `contact/`
const TERMS = `termsofuse/`

test('Home Page Loads', async ({ page }) => {
    await page.goto(HET);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText(['Advancing', 'Health', 'Equity']);
});


test('WIHE Page Loads', async ({ page }) => {
    await page.goto(HET + WIHE);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['What is Health Equity?']);
});


test('FAQ Tab Loads', async ({ page }) => {
    await page.goto(HET + FAQS);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Data']);
});

test('News Tab Loads', async ({ page }) => {
    await page.goto(HET + NEWS);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['News and Stories']);
});

test('Resources Tab Loads', async ({ page }) => {
    await page.goto(HET + RESOURCES);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Resources']);
});





test('Tracker Page Loads', async ({ page }) => {
    await page.goto(HET + EXPLOREDATA);
    const madLib = page.locator('#onboarding-start-your-search');
    await expect(madLib).toContainText(['Investigate']);
});

test('Data Catalog Page Loads', async ({ page }) => {
    await page.goto(HET + DATA);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['View and download Health Equity Tracker data sources']);
});


test('Methodology Tab Loads', async ({ page }) => {
    await page.goto(HET + METHODOLOGY);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Recommended Citation (APA) for the Health Equity Tracker:']);
});




test('About Us Page / Project Tab Loads', async ({ page }) => {
    await page.goto(HET + ABOUTUS);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're focused on equitable data.`]);
});

test('Our Team Tab Loads', async ({ page }) => {
    await page.goto(HET + OURTEAM);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're working towards a better tomorrow.`]);
});

test('Contact Tab Loads', async ({ page }) => {
    await page.goto(HET + CONTACT);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText([`Let's`, `move`, `equity`, `forward`]);
});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto(HET + TERMS);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`Terms of Use`]);
});