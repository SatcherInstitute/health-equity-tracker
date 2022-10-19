import {
	test,
	expect
} from '@playwright/test';
const EXPLORE_DATA_PAGE_LINK = "/exploredata";
const SKIP_WELCOME = `onboard=false`


test.describe('Launch Small Multiples Modal; Hover Tooltip', () => {

	test('Tracker Default (skip Welcome) to Small Multiple Modal', async ({ page }) => {

		// Load Tracker Default (with url param to bypass problematic warm welcome)	
		await page.goto(`${EXPLORE_DATA_PAGE_LINK}?${SKIP_WELCOME}`, { waitUntil: "domcontentloaded" });

		// await page.waitForNavigation()

		// click "small multiples" in infobox	
		const launchButton = page.locator('text=Launch small multiples view')


		await launchButton.click()

		// modal title with specific text should now be visible and pass a11y check	
		await expect(page.locator('#modalTitle')).toContainText("across all")
		await expect(page.locator('#modalTitle')).toBeAccessible()

		// tooltip should NOT yet be visible	
		await expect(page.locator("#vg-tooltip-element")).not.toBeVisible()

		// hover over VI bubble for "ALL" small multiples map	
		await page.locator('.MuiDialog-root [aria-label="Territory: U.S. Virgin Islands"] path').nth(1).hover()

		// tooltip should now be visible since "VI" bubble is hovered	
		await expect(page.locator("#vg-tooltip-element")).toBeVisible()
	})


});