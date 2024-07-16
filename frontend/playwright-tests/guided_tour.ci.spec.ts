import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('Guided tour of COVID-19 from Tracker Default Helper Box', () => {

    test('Guided Tour Link from Tracker Helper Box', async ({ page }) => {

        // Landing Page Loads
        await page.goto('/exploredata', { waitUntil: "commit" });
        await expect(page.getByRole('heading', { name: 'Select a topic above' })).toBeVisible();

        // First panel displays correct heading
        await expect(page.getByRole('heading', { name: 'Start Your Search', exact: true })).toBeVisible();

        // Clicking next button goes to the next step
        await page.getByRole('button', { name: "Next" }).click();

        // Second panel displays correct heading
        await expect(page.getByRole('heading', { name: 'Compare demographics, locations, and health topics', exact: true })).toBeVisible();



    })


});