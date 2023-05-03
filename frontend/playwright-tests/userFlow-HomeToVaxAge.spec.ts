import { test, expect } from '@playwright/test';
const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const VAX_USA_RACE = `mls=1.covid_vaccinations-3.00`

test.describe.configure({ mode: 'parallel' });

test.describe('Home to COVID Vax by Age', () => {

    test('Home to Tracker', async ({ page }) => {

        // Landing Page Loads
        await page.goto('/', { waitUntil: "networkidle" });
        await expect(page.locator('#main')).toContainText('Advancing Health Justice');

        // @ts-ignore
        await expect(page).toPassAxe()

        // Clicking large CTA button takes us to the tracker
        const exploreButton = page.locator('a#landingPageCTA:has-text("Explore the data")')
        exploreButton.click();
        await expect(page).toHaveURL(/.*exploredata/);

    })

    test('Tracker Default to Covid Vax', async ({ page }) => {

        // Load Tracker Default helper view
        await page.goto(`${EXPLORE_DATA_PAGE_LINK}`, { waitUntil: "networkidle" });

        // stop the pulsing button so we can target it
        await page.emulateMedia({ reducedMotion: "reduce" });

        // choose VAXX from the no topic screen
        const madLibTopic = page.locator('button:visible:has-text("select a topic")')
        madLibTopic.click();
        const covidVaxOption = page.locator('span:has-text("COVID-19 Vaccinations")')
        covidVaxOption.click();
        await expect(page).toHaveURL(/.*mls=1.covid_vaccinations-3.00/);

        // back button works properly for madlib condition changes
        await page.goBack()
        await expect(page).not.toHaveURL(/.*mls=1.covid_vaccinations-3.00/);

        // @ts-ignore
        await expect(page).toPassAxe({
            rules: {
                // TODO: fix disabled filter colors to be proper contrast
                'color-contrast': { enabled: false },
            },
        })


    })

    test('Covid Vax Toggle Age', async ({ page }) => {

        // Starting with COVID VAX
        await page.goto(`${EXPLORE_DATA_PAGE_LINK}?${VAX_USA_RACE}`, { waitUntil: "networkidle" });

        // Changing demographic dropdown setting to AGE should change URL
        await page.getByRole('button', { name: 'Demographic Race/ethnicity' }).click();
        await page.getByRole('option', { name: 'Age' }).click();
        await expect(page).toHaveURL(/.*demo=age/);


        // back button works properly for demographic toggle changes
        await page.goBack()
        await expect(page).not.toHaveURL(/.*demo=age/);
    });

    test('Covid Vax Select Map Group', async ({ page }) => {

        // Starting with COVID VAX
        await page.goto(`${EXPLORE_DATA_PAGE_LINK}?${VAX_USA_RACE}`, { waitUntil: "networkidle" });

        // Changing selected group in map card should update map and URL param
        await page.locator("#groupMenu-00-covid_vaccinations").click()
        await page.getByRole('button', { name: 'Hispanic or Latino' }).click();
        await expect(page).toHaveURL(/.*group1=Hisp%7ELat/);

        // Starting with COVID VAX - HISPANIC in URL PARAM
        await page.goto(`http://localhost:3000/exploredata?mls=1.covid_vaccinations-3.00&group1=Hisp%7ELat&group2=All`, { waitUntil: "networkidle" });

        // Map card should be on incoming group selection
        await expect(page.getByRole('heading', { name: 'Hispanic or Latino' })).toBeVisible()
    });


});