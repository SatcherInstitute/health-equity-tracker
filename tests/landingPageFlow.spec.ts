import { test, expect } from '@playwright/test';

const HET = `http://localhost:3000`
const EXPLOREDATA = `exploredata`

test('Home Page Loads', async ({ page }) => {
    await page.goto(HET);
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText(['Advancing', 'Health', 'Equity']);
    const exploreButton = await page.locator('a:has-text("Explore the Health Equity Tracker")').click();
    await expect(mainHeading).toContainText(['Advancing', 'Health', 'Equity']);
    await expect(page).toHaveURL(`${HET}/${EXPLOREDATA}`);
});

