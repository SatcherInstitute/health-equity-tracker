import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('WIHE Page Loads', async ({ page }) => {
    await page.goto('/whatishealthequity', { waitUntil: "commit" });
    await page.getByRole('heading', { name: 'What is Health Equity?', exact: true }).click();

    const accessibilityScanResults = await new AxeBuilder({ page })
        .exclude('iframe') // YouTube embed is not fully accessible
        .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);



});

