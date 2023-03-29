import { test, expect } from '@playwright/test';

const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const COVID_DEATHS_US = "?mls=1.covid_deaths-3.00"
const COMPARE_GEO_MODE = "?mls=1.covid_deaths-3.00-5.13&mlp=comparegeos"
const COVID_DEN_VS_CO = "?mls=1.covid_deaths-3.08031-5.08&mlp=comparegeos"

test.describe.configure({ mode: 'parallel' });

test('COVID Deaths: Investigate Mode to Compare Geos Mode and Back', async ({ page }) => {

    // Landing Page Loads
    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEATHS_US);

    // change carousel to "Compare Geo mode"
    const advanceMadlibCarouselArrowButton = page.locator('id=onboarding-madlib-arrow')
    await advanceMadlibCarouselArrowButton.click();

    const madlibBox = page.locator('id=madlib-carousel-container')
    await expect(madlibBox).toContainText('Compare rates of');

    // back button works properly for carousel mode changes
    await page.goBack()
    await expect(madlibBox).toContainText('Investigate');

})

test('Compare Mode Default Geos to Denver County and CO and back', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COMPARE_GEO_MODE);

    // Changing first location via madlib buttons
    const location1MadlibButton = page.locator('#madlib-carousel-container button:has-text("United States")')
    await location1MadlibButton.click();

    await page.fill('[placeholder=""]', 'denver');
    await page.keyboard.press('Enter');

    // Changing second location via madlib buttons
    const location2MadlibButton = page.locator('#madlib-carousel-container button:has-text("Georgia")')
    await location2MadlibButton.click();

    await page.fill('[placeholder=""]', 'Colorado');
    await page.keyboard.press('Enter');

    // Confirm correct URL params (Denver County vs Colorado)
    await expect(page).toHaveURL(/.*mls=1.covid_deaths-3.08031-5.08&mlp=comparegeos/);

    // back button works properly for madlib location changes

    //  back one step to denver county vs Georgia (default compare location)
    await page.goBack()
    await expect(page).toHaveURL(/.*mls=1.covid_deaths-3.08031-5.13&mlp=comparegeos/);

    //  back another step to USA vs Georgia (default 1st and 2nd compare locations)
    await page.goBack()
    await expect(page).toHaveURL(/.*mls=1.covid_deaths-3.00-5.13&mlp=comparegeos/);

})



test('Use Table of Contents to Scroll Age Adjust Card Into View and Be Focused', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEN_VS_CO);

    // find Table of Contents link to Age-Adjustment Card
    await page.getByText("Age-adjusted risk").click();

    // Find Age-Adjust Card
    const ageAdjustCard = page.locator('#age-adjusted-risk')

    // Ensure focus and visibility
    await expect(ageAdjustCard).toBeFocused();
    await expect(ageAdjustCard).toBeVisible();

});
