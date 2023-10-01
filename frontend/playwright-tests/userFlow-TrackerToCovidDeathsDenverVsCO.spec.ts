import { test, expect } from '@playwright/test';


test('Compare Mode Default Geos to Denver County vs GA', async ({ page }) => {

    await page.goto('/exploredata?mls=1.covid-3.00-5.13&mlp=comparegeos&dt1=covid_deaths', { waitUntil: "commit" });

    // Changing first location via madlib buttons
    await page.locator('#madlib-box').getByRole('button', { name: 'United States' }).click();

    await page.fill('[placeholder=""]', 'denver');
    await page.keyboard.press('Enter');

    // Confirm correct URL params (Denver County vs Georgia default compare geo)
    await expect(page).toHaveURL(/.*mls=1.covid-3.08031-5.13&mlp=comparegeos&dt1=covid_deaths/);
})

test('Compare Denver County vs GA to Denver vs CO', async ({ page }) => {

    await page.goto('/exploredata?mls=1.covid-3.08031-5.13&mlp=comparegeos&dt1=covid_deaths&group1=All&group2=All', { waitUntil: "commit" });

    // Changing second location via madlib buttons
    await page.locator('#madlib-box').getByRole('button', { name: 'Georgia' }).click();

    await page.fill('[placeholder=""]', 'colo');
    await page.keyboard.press('Enter');

    // Confirm correct URL params (Denver County vs Colorado)
    await expect(page).toHaveURL(/.*mls=1.covid-3.08031-5.08&mlp=comparegeos&dt1=covid_deaths/);
})




