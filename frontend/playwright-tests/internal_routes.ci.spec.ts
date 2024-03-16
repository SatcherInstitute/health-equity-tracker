import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({ mode: 'parallel' });


test('Methodology Hub Loads', async ({ page }) => {
    await page.goto('/methodology', { waitUntil: "commit" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Methodology Introduction']);
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

});

test('Age-Adjustment Redirects to Age-Adjustment Page of Methodology Hub', async ({ page }) => {
    await page.goto('/ageadjustment', { waitUntil: "commit" });

    await page.getByRole('heading', { name: 'Age-Adjustment', exact: true }).click();
    const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);


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
