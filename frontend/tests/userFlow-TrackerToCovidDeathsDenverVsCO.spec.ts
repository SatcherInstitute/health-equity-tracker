import { test, expect } from '@playwright/test';

const HET = `http://localhost:3000`
const EXPLOREDATA = `exploredata`
const COVID_DEN_VS_CO = "?mls=1.covid-3.08031-5.08&mlp=comparegeos"

test('User Flow from Default Tracker Page to Compare Covid Deaths by race between Denver County and State of Colorado', async ({ page }) => {

    // Landing Page Loads
    await page.goto(`${HET}/${EXPLOREDATA}`);

    // change carousel to "Compare Geo mode"
    const advanceMadlibCarouselArrowButton =  await page.locator('id=onboarding-madlib-arrow')
    await advanceMadlibCarouselArrowButton.click();

    const madlibBox = await page.locator('id=onboarding-start-your-search')
    await expect(madlibBox).toContainText('Compare rates of');


    // Changing first location via madlib buttons
    const location1MadlibButton = await page.locator('#onboarding-start-your-search button:has-text("United States")')
    await location1MadlibButton.click();

    await page.fill('[placeholder="County, State, Territory, or United States"]', 'denver');
    await page.keyboard.press('Enter');

    const populationCard = await page.locator('id=populationCard')
    await expect(populationCard).toContainText("Denver County, Colorado")

    // Changing first location via madlib buttons
    const location2MadlibButton = await page.locator('#onboarding-start-your-search button:has-text("Georgia")')
    await location2MadlibButton.click();

    await page.fill('[placeholder="County, State, Territory, or United States"]', 'Colorado');
    await page.keyboard.press('Enter');

    // Confirm correct URL
    await expect(page).toHaveURL(`${HET}/${EXPLOREDATA}${COVID_DEN_VS_CO}`);

    // Confirm no failed Vega visualizations
    let mainChunk = await page.locator('main')
    await expect(mainChunk).not.toContainText("Oops")


    // Change both data types to COVID deaths
    await page.locator(':nth-match(:text("Deaths"), 2)').waitFor();
    const deathsToggleOption1 = await page.locator(':nth-match(:text("Deaths"), 1)')
    await deathsToggleOption1.click();
    const deathsToggleOption2 = await page.locator(':nth-match(:text("Deaths"), 2)')
    await deathsToggleOption2.click()

    const missingDataLink = await page.locator('a:has-text("Read more about missing and misidentified people")')
    await missingDataLink.click()


    // Age-adjusted cards render
    const ageAdjustedCard1 = await page.locator('id=age-adjusted')
    // await ageAdjustedCard1.scrollIntoViewIfNeeded()
    const ageAdjustedCard2 = await page.locator('id=age-adjusted2')
    await expect(ageAdjustedCard1).toContainText("We do not currently have Age-Adjusted Risk of COVID-19 Death Compared to White (Non-Hispanic) broken down by Race And Ethnicity for Denver County")
    await expect(ageAdjustedCard2).toContainText("Age-Adjusted Risk of COVID-19 Death Compared to White (Non-Hispanic) in Colorado")

    // Confirm no failed Vega visualizations
    mainChunk = await page.locator('main')
    await expect(mainChunk).not.toContainText("Oops")



});
