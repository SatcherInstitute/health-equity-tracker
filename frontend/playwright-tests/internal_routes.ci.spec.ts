import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({ mode: 'parallel' });


test('Methodology Page Loads', async ({ page }) => {
    // TODO: update this route once we switch over to newer methodology version
    await page.goto('/new-methodology', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Methodology Introduction']);
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

});

test('Age-Adjustment Tab Loads', async ({ page }) => {
    // TODO: update this once we switch over to newer methodology version
    await page.goto('/ageadjustment', { waitUntil: "commit" });


});

test('About Us Page Loads', async ({ page }) => {
    await page.goto('/aboutus', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`About the Health Equity Tracker`]);
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto('/termsofuse', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`Terms of Use`]);
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

});
