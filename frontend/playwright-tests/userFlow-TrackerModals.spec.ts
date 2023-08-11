import { test, expect } from '@playwright/test';
const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const VAX_USA_RACE = `mls=1.covid_vaccinations-3.00`

test.describe.configure({ mode: 'parallel' });


test.describe('Topic and Multiple Maps Modals Open / Close States Represented in URL Param', () => {

    test('Topic Info Modal', async ({ page }) => {

        // Compare Topics Page Loads
        await page.goto('/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison', { waitUntil: "networkidle" });

        // Clicking topic info modal button launched modal
        await page.getByRole('button', { name: 'open the topic info modal' }).click();
        await expect(page).toHaveURL(/.*topic-info=true/);

        // CLOSE IT
        await page.getByRole('button', { name: 'close topic info modal' }).click();
        await expect(page).not.toHaveURL(/.*topic-info=true/);
    })

    test('Multiple Maps 1 (Left Side)', async ({ page }) => {

        // Compare Topics Page Loads
        await page.goto('/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison', { waitUntil: "networkidle" });

        // Clicking left side multiple maps button launches INCARCERATION multimap modal
        await page.locator('#rate-map').getByRole('button', { name: 'View multiple maps' }).click();
        await expect(page).toHaveURL(/.*multiple-maps=true/);
        await expect(page.getByRole('heading', { name: 'Prison incarceration in Georgia across all race and ethnicity groups' })).toBeInViewport()

        // CLOSE IT
        await page.getByRole('button', { name: 'close multiple maps modal' }).click();
        await expect(page).not.toHaveURL(/.*multiple-maps=true/);
    })

    test('Multiple Maps 2 (Right Side)', async ({ page }) => {

        // Compare Topics Page Loads
        await page.goto('/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison', { waitUntil: "networkidle" });

        // Clicking right side multiple maps button launches POVERTY multimap modal
        await page.locator('#rate-map2').getByRole('button', { name: 'View multiple maps' }).click();
        await expect(page).toHaveURL(/.*multiple-maps2=true/);
        await expect(page.getByRole('heading', { name: 'People below the poverty line in Georgia across all race and ethnicity groups' })).toBeInViewport()

        // CLOSE IT
        await page.getByRole('button', { name: 'close multiple maps modal' }).click();
        await expect(page).not.toHaveURL(/.*multiple-maps2=true/);
    })


});