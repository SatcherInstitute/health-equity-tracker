import { test, expect } from '@playwright/test';
import { EXPLORE_DATA_PAGE_LINK } from './otherInternalPageRoutes.spec';

const VAX_USA_RACE = `?mls=1.covid_vaccinations-3.00`
const BY_AGE = `&demo=age`

test.describe.configure({ mode: 'parallel' });

test.describe('Home to COVID Vax by Age', () => {

    test('Home to Tracker to Covid Vax', async ({ page }) => {

        // Landing Page Loads
        await page.goto('/');
        const mainHeading = page.locator('#main');
        await expect(mainHeading).toContainText(['Advancing', 'Health', 'Equity']);

        // Clicking large CTA button takes us to the tracker
        const exploreButton = await page.locator('a:has-text("Explore the Health Equity Tracker")')
        exploreButton.click();
        await expect(page).toHaveURL(`${EXPLORE_DATA_PAGE_LINK}`);

        // changes madlib to VAXX properly
        const madLibTopic = await page.locator('button:has-text("COVID-19")')
        madLibTopic.click();
        const covidVaxOption = await page.locator('span:has-text("COVID-19 Vaccinations")')
        covidVaxOption.click();
        await expect(page).toHaveURL(`${EXPLORE_DATA_PAGE_LINK}${VAX_USA_RACE}`);

        // Confirm no failed Vega visualizations
        let mainChunk = await page.locator('main')
        await expect(mainChunk).not.toContainText("Oops")

        // MAP CARD contains correct title
        const mapCard = await page.locator('#map')
        await expect(mapCard).toContainText(['COVID-19 Vaccinations']);
    })

    test('Covid Vax Toggle Age', async ({ page }) => {

        // Starting with COVID VAX
        await page.goto(`${EXPLORE_DATA_PAGE_LINK}${VAX_USA_RACE}`);

        // Changing to AGE demographic toggle should change URL
        const ageToggleButton = await page.locator('button:has-text("Age")')
        ageToggleButton.click();
        await expect(page).toHaveURL(`${EXPLORE_DATA_PAGE_LINK}${VAX_USA_RACE}${BY_AGE}`);

        // Age should be reflected in card title
        const barChartCard = await page.locator('#bar')
        await expect(barChartCard).toContainText(['COVID-19', 'Vaccinations', 'By Age']);

        // Confirm no failed Vega visualizations
        let mainChunk = await page.locator('main')
        await expect(mainChunk).not.toContainText("Oops")
    });


});