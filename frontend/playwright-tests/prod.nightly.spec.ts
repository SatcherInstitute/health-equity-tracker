import { test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test(`Production Site Loads`, async ({ page }) => {
    await page.goto("https://healthequitytracker.org", { waitUntil: "commit" });

});

