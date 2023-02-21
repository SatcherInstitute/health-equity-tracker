import { test, expect } from '@playwright/test';

const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const COVID_CASES_US = "?mls=1.covid-3.00&dt1=covid_cases&demo=race_and_ethnicity"
const COMPARE_GEO_MODE = "?mls=1.covid-3.00-5.13&mlp=comparegeos"
const COVID_DEN_VS_CO = "?mls=1.covid-3.08031-5.08&mlp=comparegeos"
const DEATHS_DEN_VS_CO = "?mls=1.covid-3.08031-5.08&mlp=comparegeos&dt1=covid_deaths&dt2=covid_deaths"

test.describe.configure({ mode: 'parallel' });

test('Default Tracker to Compare Mode', async ({ page }) => {

    // Landing Page Loads
    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_CASES_US);

    // change carousel to "Compare Geo mode"
    const advanceMadlibCarouselArrowButton = page.locator('id=onboarding-madlib-arrow')
    await advanceMadlibCarouselArrowButton.click();

    const madlibBox = page.locator('id=madlib-carousel-container')
    await expect(madlibBox).toContainText('Compare rates of');

    // back button works properly for carousel mode changes
    await page.goBack()
    await expect(madlibBox).toContainText('Investigate');

})

test('Compare Mode Default Geos to Denver County and CO', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COMPARE_GEO_MODE);


    // Changing first location via madlib buttons
    const location1MadlibButton = page.locator('#madlib-carousel-container button:has-text("United States")')
    await location1MadlibButton.click();

    await page.fill('[placeholder=""]', 'denver');
    await page.keyboard.press('Enter');

    // Changing first location via madlib buttons
    const location2MadlibButton = page.locator('#madlib-carousel-container button:has-text("Georgia")')
    await location2MadlibButton.click();

    await page.fill('[placeholder=""]', 'Colorado');
    await page.keyboard.press('Enter');

    // Confirm correct URL params (Denver County vs Colorado)
    await expect(page).toHaveURL(/.*mls=1.covid-3.08031-5.08&mlp=comparegeos/);

    // back button works properly for madlib location changes

    //  back one step to denver county vs Georgia (default compare location)
    await page.goBack()
    await expect(page).toHaveURL(/.*?mls=1.covid-3.08031-5.13&mlp=comparegeos/);

    //  back another step to USA vs Georgia (default 1st and 2nd compare locations)
    await page.goBack()
    await expect(page).toHaveURL(/.*?mls=1.covid-3.00-5.13&mlp=comparegeos/);

})


test('Switch Data Types for Both Geos', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEN_VS_CO);
    // @ts-ignore
    // await expect(page).toPassAxe({
    //     rules: {
    //         // TODO: fix disabled filter colors to be proper contrast
    //         'color-contrast': { enabled: false },
    //     },
    // })

    // Change both data types to COVID deaths
    page.locator(':nth-match(:text("Deaths"), 2)').waitFor();
    const deathsToggleOption1 = page.locator(':nth-match(:text("Deaths"), 1)')
    await deathsToggleOption1.click();
    const deathsToggleOption2 = page.locator(':nth-match(:text("Deaths"), 2)')
    await deathsToggleOption2.click()

    // Confirm correct URL params
    await expect(page).toHaveURL(/.*dt1=covid_deaths/);
    await expect(page).toHaveURL(/.*dt2=covid_deaths/);

    // back button works properly for data type toggle changes
    await page.goBack()
    await expect(page).toHaveURL(/.*dt1=covid_deaths/);
    await expect(page).not.toHaveURL(/.*dt2=covid_deaths/);

});



test('Use Table of Contents to Scroll Age Adjust Card Into View and Be Focused', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + DEATHS_DEN_VS_CO);
    // @ts-ignore
    // await expect(page).toPassAxe({
    //     rules: {
    //         // TODO: fix disabled filter colors to be proper contrast
    //         'color-contrast': { enabled: false },
    //     },
    // })

    // find Table of Contents link to Age-Adjustment Card
    const ageAdjustStepLink = page.locator('button:has-text("Age-adjusted risk")')
    await ageAdjustStepLink.click()

    // Find Age-Adjust Card
    const ageAdjustCard = page.locator('#age-adjusted-risk')

    // Ensure focus and visibility
    await expect(ageAdjustCard).toBeFocused();
    await expect(ageAdjustCard).toBeVisible();

});
