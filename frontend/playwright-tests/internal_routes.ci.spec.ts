import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({ mode: 'parallel' });


test('Methodology Hub Loads', async ({ page }) => {
    await page.goto('/methodology', { waitUntil: "commit" });
    const mainSection = page.locator('section#main');
    await expect(mainSection).toContainText('Methodology Introduction');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
});

test('Age-Adjustment Redirects to Age-Adjustment Page of Methodology Hub', async ({ page }) => {
    await page.goto('/ageadjustment', { waitUntil: "commit" });
    const mainSection = page.locator('section#main');
    const ageAdjustedRatiosSection = mainSection.locator('section#age-adjusted-ratios');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
});

test('About Us Page Loads', async ({ page }) => {
    await page.goto('/aboutus', { waitUntil: "commit" });
    const mainSection = page.locator('main#main');
    const mainHeading = mainSection.locator('h2#main');
    await expect(mainHeading).toHaveText('About the Health Equity Tracker');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto('/termsofuse', { waitUntil: "commit" });
    const mainSection = page.locator('main#main');
    const mainHeading = mainSection.locator('h2#main');
    await expect(mainHeading).toHaveText('Terms of Use');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
});
