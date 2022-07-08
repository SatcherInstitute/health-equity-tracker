import { test, expect } from '@playwright/test';

const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const DEFAULT_COMPARE_GEO_MODE = "?mls=1.covid-3.00-5.13&mlp=comparegeos"
const COVID_DEN_VS_CO = "?mls=1.covid-3.08031-5.08&mlp=comparegeos"

test('Default Tracker to Compare Mode', async ({ page }) => {

    // Landing Page Loads
    await page.goto(EXPLORE_DATA_PAGE_LINK);

    // change carousel to "Compare Geo mode"
    const advanceMadlibCarouselArrowButton = page.locator('id=onboarding-madlib-arrow')
    await advanceMadlibCarouselArrowButton.click();

    const madlibBox = page.locator('id=onboarding-start-your-search')
    await expect(madlibBox).toContainText('Compare rates of');

})

test('Compare Mode Default Geos to Denver County and CO', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + DEFAULT_COMPARE_GEO_MODE);


    // Changing first location via madlib buttons
    const location1MadlibButton = page.locator('#onboarding-start-your-search button:has-text("United States")')
    await location1MadlibButton.click();

    await page.fill('[placeholder="County, State, Territory, or United States"]', 'denver');
    await page.keyboard.press('Enter');

    const populationCard = page.locator('id=populationCard')
    await expect(populationCard).toContainText("Denver County, Colorado")

    // Changing first location via madlib buttons
    const location2MadlibButton = page.locator('#onboarding-start-your-search button:has-text("Georgia")')
    await location2MadlibButton.click();

    await page.fill('[placeholder="County, State, Territory, or United States"]', 'Colorado');
    await page.keyboard.press('Enter');

    // Confirm correct URL
    await expect(page).toHaveURL(EXPLORE_DATA_PAGE_LINK + COVID_DEN_VS_CO);

    // Confirm no failed Vega visualizations
    let mainChunk = page.locator('main')
    await expect(mainChunk).not.toContainText("Oops")

})


test('Switch Data Types for Both Geos', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEN_VS_CO);


    // Change both data types to COVID deaths
    page.locator(':nth-match(:text("Deaths"), 2)').waitFor();
    const deathsToggleOption1 = page.locator(':nth-match(:text("Deaths"), 1)')
    await deathsToggleOption1.click();
    const deathsToggleOption2 = page.locator(':nth-match(:text("Deaths"), 2)')
    await deathsToggleOption2.click()

    const missingDataLink = page.locator('a:has-text("Read more about missing and misidentified people")')
    await missingDataLink.click()


    // Age-adjusted cards render
    const ageAdjustedCard1 = page.locator('id=age-adjusted')
    // await ageAdjustedCard1.scrollIntoViewIfNeeded()
    const ageAdjustedCard2 = page.locator('id=age-adjusted2')
    await expect(ageAdjustedCard1).toContainText("We do not currently have Age-Adjusted Risk of COVID-19 Death Compared to White (Non-Hispanic) broken down by Race And Ethnicity for Denver County")
    await expect(ageAdjustedCard2).toContainText("Age-Adjusted Risk of COVID-19 Death Compared to White (Non-Hispanic) in Colorado")

    // Confirm no failed Vega visualizations
    let mainChunk = page.locator('main')
    await expect(mainChunk).not.toContainText("Oops")

});

// test('Should fail', async ({ page }) => {
//     await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEN_VS_CO);
//     const mainHeading = page.locator('#main');
//     await expect(mainHeading).toContainText('FAIL');
// });
