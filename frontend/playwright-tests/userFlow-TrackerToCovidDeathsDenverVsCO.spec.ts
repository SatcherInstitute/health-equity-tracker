import { test, expect } from '@playwright/test';

const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const COVID_DEATHS_US = "?mls=1.covid_deaths-3.00"
const COMPARE_GEO_MODE = "?mls=1.covid_deaths-3.00-5.13&mlp=comparegeos"
const COVID_DEN_VS_CO = "?mls=1.covid_deaths-3.08031-5.08&mlp=comparegeos"

test.describe.configure({ mode: 'parallel' });

test('COVID Deaths: Investigate Mode to Compare Geos Mode and Back', async ({ page }) => {

    // Landing Page Loads
    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEATHS_US);

    // change  to "Compare Places mode"
    await page.getByRole('button', { name: 'Off' }).click();
    await page.getByRole('option', { name: 'Places' }).click();

    const madlibBox = page.locator('id=madlib-container')
    await expect(madlibBox).toContainText('Compare rates of');

    // back button works properly for tracker mode changes
    await page.goBack()
    await expect(madlibBox).toContainText('Investigate');

})

test('Compare Mode Default Geos to Denver County and CO and back', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COMPARE_GEO_MODE);

    // Changing first location via madlib buttons
    await page.locator('#madlib-box').getByRole('button', { name: 'United States' }).click();

    await page.fill('[placeholder=""]', 'denver');
    await page.keyboard.press('Enter');

    // Changing second location via madlib buttons
    await page.locator('#madlib-box').getByRole('button', { name: 'Georgia' }).click();

    await page.fill('[placeholder=""]', 'colo');
    await page.keyboard.press('Enter');

    // Confirm correct URL params (Denver County vs Colorado)
    await expect(page).toHaveURL(/.*mls=1.covid_deaths-3.08031-5.08&mlp=comparegeos/);

    // back button works properly for madlib location changes

    //  back one step to denver county vs Georgia (default compare location)
    await page.goBack({ waitUntil: "networkidle" })
    await expect(page).toHaveURL(/.*mls=1.covid_deaths-3.08031-5.13&mlp=comparegeos/);

    //  back another step to USA vs Georgia (default 1st and 2nd compare locations)
    await page.goBack()
    await expect(page).toHaveURL(/.*mls=1.covid_deaths-3.00-5.13&mlp=comparegeos/);

})

test('Use Table of Contents to Scroll Unknown Map Into View and Be Focused', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEN_VS_CO);

    // find Table of Contents link to Unknown Map
    await page.getByRole('button', { name: 'Scroll to Unknown demographic map', exact: true }).click();

    // Find Unknown Map Card
    const unknownMapCard = page.locator('#unknown-demographic-map')

    // Ensure focus and visibility
    await expect(unknownMapCard).toBeFocused();
    await expect(unknownMapCard).toBeVisible();

});


