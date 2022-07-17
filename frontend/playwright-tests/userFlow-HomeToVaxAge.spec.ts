import { test, expect } from '@playwright/test';

const EXPLORE_DATA_PAGE_LINK = "/exploredata";

const VAX_USA_RACE = `?mls=1.covid_vaccinations-3.00`
const BY_AGE = `&demo=age`

const SKIP_WELCOME = `&onboard=false`


test.describe('Home to COVID Vax by Age', () => {

    test('Home to Tracker to Covid Vax', async ({ page }) => {

        // Landing Page Loads
        await page.goto('/', { waitUntil: "networkidle" }); 
        await expect(page).toBeAccessible()

        const mainHeading = page.locator('#main');
        await expect(mainHeading).toContainText(['Advancing', 'Health', 'Equity']);

        // Clicking large CTA button takes us to the tracker
        const exploreButton = page.locator('a:has-text("Explore the Health Equity Tracker")')
        exploreButton.click();
        await expect(page).toHaveURL(`${EXPLORE_DATA_PAGE_LINK}`);

        // changes madlib to VAXX properly
        const madLibTopic = page.locator('button:has-text("COVID-19")')
        madLibTopic.click();
        const covidVaxOption = page.locator('span:has-text("COVID-19 Vaccinations")')
        covidVaxOption.click();
        await expect(page).toHaveURL(`${EXPLORE_DATA_PAGE_LINK}${VAX_USA_RACE}`);

    })

    test('Covid Vax Toggle Age', async ({ page }) => {

        // Starting with COVID VAX
        await page.goto(`${EXPLORE_DATA_PAGE_LINK}${VAX_USA_RACE}${SKIP_WELCOME}`, { waitUntil: "networkidle" });

        // Changing to AGE demographic toggle should change URL
        const ageToggleButton = page.locator('button:has-text("Age")')
        await ageToggleButton.click();
        await expect(page).toHaveURL(`${EXPLORE_DATA_PAGE_LINK}${VAX_USA_RACE}${SKIP_WELCOME}${BY_AGE}`);
    });


});