import { test, expect } from '@playwright/test';
test.describe.configure({ mode: 'parallel' });

test.describe('Tracker Card Downloads', () => {
    test('Download map card image', async ({ page }) => {

        // start at HIV in US
        await page.goto('http://localhost:3000/exploredata?mls=1.hiv_diagnoses-3.00&mlp=disparity');

        // click map card download button
        await page.locator('#rate-map').getByRole('button', { name: 'Save card image' }).click();
        const downloadPromise = page.waitForEvent('download');
        const download = await downloadPromise;

        // expect no errors
        expect(await download.failure()).toBeNull()
    })
});