import { test, expect } from '@playwright/test';

test.describe('CAWP - National US Congress with Time Charts', () => {

	test('RateTrends card has correct Y-Axis Label', async ({ page }) => {
		await page.goto('/exploredata?mls=1.women_in_legislative_office-3.00&dt1=women_us_congress#rates-over-time', { waitUntil: "networkidle" });
		await expect(page).toBeAccessible()
		await expect(page.locator('#rates-over-time')).toContainText('% of US congress members →');
	})

	test('Data Table card contains new componsite Race group', async ({ page }) => {
		await page.goto('/exploredata?mls=1.women_in_legislative_office-3.00&dt1=women_us_congress#data-table', { waitUntil: "networkidle" });
		await expect(page).toBeAccessible()
		await expect(page.locator('#data-table')).toContainText('American Indian, Alaska Native, Asian & Pacific Islander');
	})

});