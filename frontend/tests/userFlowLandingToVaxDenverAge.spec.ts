import { test, expect } from '@playwright/test';

const HET = `http://localhost:3000`
const EXPLOREDATA = `exploredata`

const VAX_USA_RACE = `?mls=1.covid_vaccinations-3.00`
const BY_AGE = `&demo=age`
const VAX_DENVER_AGE = `?mls=1.covid_vaccinations-3.08031&demo=age`

test('Home Page Loads', async ({ page }) => {

    await page.goto(HET);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText(['Advancing', 'Health', 'Equity']);

    const exploreButton = await page.locator('a:has-text("Explore the Health Equity Tracker")').click();
    await expect(mainHeading).toContainText(['Advancing', 'Health', 'Equity']);
    await expect(page).toHaveURL(`${HET}/${EXPLOREDATA}`);

    await page.locator('button:has-text("COVID-19")').click();

    await page.locator('span:has-text("COVID-19 Vaccinations")').click();
    await expect(page).toHaveURL(`${HET}/${EXPLOREDATA}${VAX_USA_RACE}`);
    const mapCardTitle = await page.locator('#mapCard article header')
    await expect(mapCardTitle).toContainText(['COVID-19', 'Vaccinations']);

    await page.locator('button:has-text("Age")').click();

    await expect(page).toHaveURL(`${HET}/${EXPLOREDATA}${VAX_USA_RACE}${BY_AGE}`);
    const barChartCardTitle = await page.locator('#simpleBarChartCard article header')
    await expect(barChartCardTitle).toContainText(['COVID-19', 'Vaccinations', 'By Age']);

    await page.locator('#onboarding-start-your-search button:has-text("United States")').click();
    await page.keyboard.press('Tab');
    await page.keyboard.type('Denver');
    await page.keyboard.press('Enter');

    await page.evaluate(() => window.scrollTo({
        top: 5000,
        behavior: 'smooth'
    }));

    await page.locator('#disparityBarChartCard article header')
    const disparityCardTitle = page.locator('#disparityBarChartCard article header')
    await expect(disparityCardTitle).toContainText(['Share Of', 'Denver County']);





});
