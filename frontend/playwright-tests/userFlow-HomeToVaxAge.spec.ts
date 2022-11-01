import { test, expect } from '@playwright/test';
const EXPLORE_DATA_PAGE_LINK = "/exploredata";

const VAX_USA_RACE = `mls=1.covid_vaccinations-3.00`
const SKIP_WELCOME = `onboard=false`


test.describe('Home to COVID Vax by Age', () => {

    test('Home to Tracker', async ({ page }) => {

        // Landing Page Loads
        await page.goto('/', { waitUntil: "networkidle" });
        await expect(page).toBeAccessible()

        const mainHeading = page.locator('#main');
        await expect(mainHeading).toContainText('Better Data for Equity');

        // Clicking large CTA button takes us to the tracker
        const exploreButton = page.locator('a#landingPageCTA:has-text("Explore the data")')
        exploreButton.click();
        await expect(page).toHaveURL(/.*exploredata/);
    })

    test('Tracker Default (skip Welcome) to Covid Vax', async ({ page }) => {

        // Load Tracker Default (with url param to bypass problematic warm welcome)
        await page.goto(`${EXPLORE_DATA_PAGE_LINK}?${SKIP_WELCOME}`, { waitUntil: "networkidle" });
        await expect(page).toBeAccessible({
            rules: {
                // TODO: fix disabled filter colors to be proper contrast
                'color-contrast': { enabled: false },
            },
        })

        // changes madlib to VAXX properly
        const madLibTopic = page.locator('button:has-text("COVID-19")')
        madLibTopic.click();
        const covidVaxOption = page.locator('span:has-text("COVID-19 Vaccinations")')
        covidVaxOption.click();
        await expect(page).toHaveURL(/.*mls=1.covid_vaccinations-3.00/);

        // back button works properly for madlib condition changes
        await page.goBack()
        await expect(page).not.toHaveURL(/.*mls=1.covid_vaccinations-3.00/);

    })

    test('Covid Vax Toggle Age', async ({ page }) => {

        // Starting with COVID VAX
        await page.goto(`${EXPLORE_DATA_PAGE_LINK}?${VAX_USA_RACE}&${SKIP_WELCOME}`, { waitUntil: "networkidle" });

        // Changing to AGE demographic toggle should change URL
        const ageToggleButton = page.locator('button:has-text("Age")')
        await ageToggleButton.click();
        await expect(page).toHaveURL(/.*demo=age/);

        // back button works properly for demographic toggle changes
        await page.goBack()
        await expect(page).not.toHaveURL(/.*demo=age/);

    });


});