import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('Topic and Multiple Maps Modals Open / Close States Represented in URL Param', () => {

    test('Topic Info Modal from Sidebar', async ({ page }) => {

        // Compare Topics Page Loads
        await page.goto('/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison', { waitUntil: "networkidle" });

        // Clicking topic info modal button launched modal
        await page.getByRole('button', { name: 'open the topic info modal' }).click();
        await expect(page).toHaveURL(/.*topic-info=true/);

        // clicking methodology link takes directly to #hiv section
        await page.getByRole('link', { name: 'methodology' }).click();
        const IncarcerationSubheading = page.getByRole('heading', { name: 'Incarceration', exact: true })
        await expect(IncarcerationSubheading).toBeInViewport()
        await expect(page).toHaveURL(/.*methodology#incarceration/);


        // browser back button takes you back to the open topic modal
        page.goBack()

        // CLOSE modal
        await page.getByRole('button', { name: 'close topic info modal' }).click();
        await expect(page).not.toHaveURL(/.*topic-info=true/);
    })

    test('Topic Info Modal from Map Legend', async ({ page }) => {


        await page.goto('http://localhost:3000/');
        await page.locator('#landingPageCTA').click();
        await page.getByRole('link', { name: 'Uninsurance in Florida & California, by sex' }).click();
        await page.locator('#rate-map2').getByRole('button', { name: 'Click for more info on uninsured people' }).click();
        await page.getByRole('link', { name: 'methodology' }).click();
        await page.getByRole('link', { name: 'age-adjustment methodology' }).click();
        await page.getByRole('link', { name: 'COVID-19 deaths' }).click();
        await page.getByRole('link', { name: 'data reporting gaps' }).click();
        await page.getByText('A COVID-19 case is an individual who has been determined').click();
        await page.getByText('Investigate rates ofCOVID-19 Deaths in theUnited States DemographicRace/eth').press('Meta+c');

    })




    test('Multiple Maps 1 (Left Side)', async ({ page }) => {

        // Compare Topics Page With Multimap Open Loads
        await page.goto('/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison&multiple-maps=true', { waitUntil: "networkidle" });
        await expect(page.getByRole('heading', { name: 'Prison incarceration in Georgia across all race and ethnicity groups' })).toBeVisible()

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
        await expect(page.getByRole('heading', { name: 'People below the poverty line in Georgia across all race and ethnicity groups' })).toBeVisible()

        // CLOSE IT
        await page.getByRole('button', { name: 'close multiple maps modal' }).click();
        await expect(page).not.toHaveURL(/.*multiple-maps2=true/);
    })


});