import { test, expect } from '@playwright/test';

const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const EXPLICIT_DEFAULT_SETTINGS = "?dt1=covid_cases&demo=race_and_ethnicity"
const DEFAULT_COMPARE_GEO_MODE = "?mls=1.covid-3.00-5.13&mlp=comparegeos"
const COVID_DEN_VS_CO = "?mls=1.covid-3.08031-5.08&mlp=comparegeos"
const DEATHS_DEN_VS_CO = "?mls=1.covid-3.08031-5.08&mlp=comparegeos&dt1=covid_deaths&dt2=covid_deaths"
const SKIP_WELCOME = `&onboard=false`

test.describe.configure({ mode: 'parallel' });

test('Default Tracker to Compare Mode', async ({ page }) => {

    // Landing Page Loads
    await page.goto(EXPLORE_DATA_PAGE_LINK + EXPLICIT_DEFAULT_SETTINGS + SKIP_WELCOME);

    // change carousel to "Compare Geo mode"
    const advanceMadlibCarouselArrowButton = page.locator('id=onboarding-madlib-arrow')
    await advanceMadlibCarouselArrowButton.click();

    const madlibBox = page.locator('id=onboarding-start-your-search')
    await expect(madlibBox).toContainText('Compare rates of');

})

test('Compare Mode Default Geos to Denver County and CO', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + DEFAULT_COMPARE_GEO_MODE + SKIP_WELCOME);


    // Changing first location via madlib buttons
    const location1MadlibButton = page.locator('#onboarding-start-your-search button:has-text("United States")')
    await location1MadlibButton.click();

    await page.fill('[placeholder="County, State, Territory, or United States"]', 'denver');
    await page.keyboard.press('Enter');

    // Changing first location via madlib buttons
    const location2MadlibButton = page.locator('#onboarding-start-your-search button:has-text("Georgia")')
    await location2MadlibButton.click();

    await page.fill('[placeholder="County, State, Territory, or United States"]', 'Colorado');
    await page.keyboard.press('Enter');

    // Confirm correct URL params
    await expect(page).toHaveURL(/.*mls=1.covid-3.08031-5.08&mlp=comparegeos/);

})


test('Switch Data Types for Both Geos', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + COVID_DEN_VS_CO + SKIP_WELCOME);

    // TODO React Joyride a11y issue: Modals need labels. https://github.com/gilbarbara/react-joyride/issues/706
    // Should submit a PR to fix dependency package

    await expect(page).toBeAccessible()

    // Change both data types to COVID deaths
    page.locator(':nth-match(:text("Deaths"), 2)').waitFor();
    const deathsToggleOption1 = page.locator(':nth-match(:text("Deaths"), 1)')
    await deathsToggleOption1.click();
    const deathsToggleOption2 = page.locator(':nth-match(:text("Deaths"), 2)')
    await deathsToggleOption2.click()

    // Confirm correct URL params
    await expect(page).toHaveURL(/.*dt1=covid_deaths/);
    await expect(page).toHaveURL(/.*dt2=covid_deaths/);

});



test('Use Table of Contents to Scroll Age Adjust Card Into View and Be Focused', async ({ page }) => {

    await page.goto(EXPLORE_DATA_PAGE_LINK + DEATHS_DEN_VS_CO + SKIP_WELCOME);

    await expect(page).toBeAccessible()


    // find Table of Contents link to Age-Adjustment Card
    const ageAdjustStepLink = page.locator('button:has-text("Age-Adjusted Risk Ratios")')
    await ageAdjustStepLink.click()

    // Ensure URL Hash updates
    await expect(page).toHaveURL(/.*#age-adjusted-risk/);

    // Find Age-Adjust Card
    const ageAdjustCard = page.locator('#age-adjusted-risk')

    // Ensure focus and visibility
    await expect(ageAdjustCard).toBeFocused();
    await expect(ageAdjustCard).toBeVisible();


});
