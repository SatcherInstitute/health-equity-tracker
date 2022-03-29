import { test, expect } from '@playwright/test';

const HET = `http://localhost:3000/`
const EXPLOREDATA = `exploredata/`
const WIHE = `whatishealthequity/`
const DATA = `datacatalog/`
const ABOUTUS = `aboutus/`

test('Home Page Loads', async ({ page }) => {
    await page.goto(HET);
    const heroHeading = page.locator('#main');
    await expect(heroHeading).toContainText(['Advancing', 'Health', 'Equity']);
});

test('WIHE Page Loads', async ({ page }) => {
    await page.goto(HET + WIHE);
    const heroHeading = page.locator('#main');
    await expect(heroHeading).toHaveText(['What is Health Equity?']);
});

test('Tracker Page Loads', async ({ page }) => {
    await page.goto(HET + EXPLOREDATA);
    const madLib = page.locator('#onboarding-start-your-search');
    await expect(madLib).toContainText(['Investigate']);
});

test('Data Catalog Page Loads', async ({ page }) => {
    await page.goto(HET + DATA);
    const heading = page.locator('#main');
    await expect(heading).toHaveText(['View and download Health Equity Tracker data sources']);
});


test('About Us Page Loads', async ({ page }) => {
    await page.goto(HET + ABOUTUS);
    const heroHeading = page.locator('#main');
    await expect(heroHeading).toHaveText([`We're focused on equitable data.`]);
});
