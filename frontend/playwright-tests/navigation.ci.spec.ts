import { test, expect } from '@playwright/test';

test('COVID Deaths: Investigate Mode to Compare Geos Mode and Back', async ({ page }) => {

	// Landing Page Loads
	await page.goto('/exploredata?mls=1.covid-3.00&dt1=covid_deaths');

	// change  to "Compare Places mode"
	await page.getByText('Off').nth(1).click();
	await page.getByRole('option', { name: 'Places' }).click();

	const madlibBox = page.locator('id=madlib-container')
	await expect(madlibBox).toContainText('Compare rates of');

	// back button works properly for tracker mode changes
	await page.goBack()
	await expect(madlibBox).toContainText('Investigate');

})

test('Clicking a state on national map loads state report; back button returns to national', async ({ page }) => {

	//start at HIV national
	await page.goto('/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence', { waitUntil: "commit" });

	// click state of Mass.
	await page.locator('path:nth-child(48)').click();

	// Confirm correct madlib setting includes FIPS for state of Mass.
	await expect(page).toHaveURL(/.*mls=1.hiv-3.25/);

	// back button should take you back to National report
	await page.goBack()
	await expect(page).toHaveURL(/.*mls=1.hiv-3.00/);
})



test('Clicking a county on state map loads county report; back button returns to state', async ({ page }) => {

	//start at Jail in Georgia, by race
	await page.goto('/exploredata?mls=1.incarceration-3.13&mlp=disparity&dt1=jail', { waitUntil: "commit" });

	// click on specific county
	await page.locator('path:nth-child(122)').click();

	// Confirm correct madlib setting includes FIPS for county
	await expect(page).toHaveURL(/.*mls=1.incarceration-3.13241/);

	// TODO: This is broken, re-enable once fixed. Possibly related to #2712
	// back button should take you back to state report
	// await page.goBack()
	// await expect(page).toHaveURL(/.*mls=1.incarceration-3.13/);
})


test('Clear selections button from Compare Topics mode returns tracker to default state', async ({ page }) => {
	// start at tracker default page (implicit default params)
	await page.goto('/exploredata', { waitUntil: "commit" });

	// choose sample compare mode report
	await page.getByRole('link', { name: 'Prison & poverty in Georgia, by race' }).click();

	// clear topic
	await page.getByRole('button', { name: 'Poverty', exact: true }).click();
	await page.getByRole('link', { name: 'Clear selections' }).click();

	// should return to default page (with explicit params)
	await expect(page).toHaveURL('/exploredata');

});


test('Use Table of Contents to Scroll Unknown Map Into View and Be Focused', async ({ page }) => {

	await page.goto('/exploredata?mls=1.incarceration-3.00&mlp=disparity&dt1=hiv_prevalence', { waitUntil: "commit" });

	// find Table of Contents link to Unknown Map
	await page.getByRole('button', { name: 'Unknown demographic map', exact: true }).click();

	// ensure card is on the page, focused, and visible
	const unknownMapCard = page.locator('#unknown-demographic-map')
	await expect(unknownMapCard).toBeFocused();
	await expect(unknownMapCard).toBeVisible();

});




test('Including the Extremes Mode Param in URL should load report with Extremes Mode Enabled', async ({ page }) => {

	await page.goto('/exploredata?mls=1.incarceration-3.00&mlp=disparity&dt1=hiv_prevalence&extremes=true', { waitUntil: "commit" });
  await page.getByRole('heading', { name: '(only states/territories with' }).click();
  await page.getByRole('heading', { name: 'Highest:' }).click();
  await page.getByRole('heading', { name: 'Lowest:' }).click();
  await page.getByRole('button', { name: 'Reset map filter' }).click();
  await page.getByRole('button', { name: 'Expand state/territory rate' }).click();
});




test('Extremes Mode Param in URL should work for both sides of Compare mode report', async ({ page }) => {

	await page.goto('exploredata?mls=1.hiv-3.00-5.13&mlp=comparegeos&dt1=hiv_prevalence&extremes2=true', { waitUntil: "commit" });

	// map 1 in normal mode to start
	await page.locator('#rate-map').getByRole('heading', { name: 'Ages 13+' }).click();
  await page.locator('#rate-map').getByRole('button', { name: 'Expand state/territory rate' }).click();

	// map 2 in extremes mode to start
  await page.locator('#rate-map2').getByRole('heading', { name: 'Ages 13+ (only counties with' }).click();
  await page.locator('#rate-map2').getByRole('button', { name: 'Reset map filter' }).click();
  await page.locator('#rate-map2').getByRole('heading', { name: 'Ages 13+' }).click();
});