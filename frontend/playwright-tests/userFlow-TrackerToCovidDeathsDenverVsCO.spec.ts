import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });


test('Compare Mode Default Geos to Denver County and CO', async ({ page }) => {

    await page.goto('/exploredata?mls=1.covid-3.00-5.13&mlp=comparegeos&dt1=covid_deaths');

    // Changing first location via madlib buttons
    await page.locator('#madlib-box').getByRole('button', { name: 'United States' }).click();

    await page.fill('[placeholder=""]', 'denver');
    await page.keyboard.press('Enter');

    // Changing second location via madlib buttons
    await page.locator('#madlib-box').getByRole('button', { name: 'Georgia' }).click();

    await page.fill('[placeholder=""]', 'colo');
    await page.keyboard.press('Enter');

    // Confirm correct URL params (Denver County vs Colorado)
    await expect(page).toHaveURL(/.*mls=1.covid-3.08031-5.08&mlp=comparegeos&dt1=covid_deaths/);
})

test('Use Table of Contents to Scroll Unknown Map Into View and Be Focused', async ({ page }) => {

    await page.goto('/exploredata?mls=1.covid-3.08031-5.08&mlp=comparegeos&dt1=covid_deaths');

    // find Table of Contents link to Unknown Map
    await page.getByRole('button', { name: 'Unknown demographic map', exact: true }).click();

    // ensure card is on the page, focused, and visible
    const unknownMapCard = page.locator('#unknown-demographic-map')
    await expect(unknownMapCard).toBeFocused();
    await expect(unknownMapCard).toBeVisible();

});



