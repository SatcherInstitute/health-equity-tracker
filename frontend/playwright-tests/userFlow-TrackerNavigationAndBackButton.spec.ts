import { test, expect } from '@playwright/test';

// Subscribe to 'request' and 'response' events.

// function ignoreUrl(url) {
// 	return url.includes("node_modules") || url.includes("src") || url.includes("fonts")
// }



test('COVID Deaths: Investigate Mode to Compare Geos Mode and Back', async ({ page }) => {

	// Landing Page Loads
	await page.goto('/exploredata?mls=1.covid-3.00&dt1=covid_deaths');

	// change  to "Compare Places mode"
	await page.getByRole('button', { name: 'Off' }).click();
	await page.getByRole('option', { name: 'Places' }).click();

	const madlibBox = page.locator('id=madlib-container')
	await expect(madlibBox).toContainText('Compare rates of');

	// back button works properly for tracker mode changes
	await page.goBack()
	await expect(madlibBox).toContainText('Investigate');

})

test('Clicking a state on national map loads state report; back button returns to national', async ({ page }) => {

	// page.on('request', request => !ignoreUrl(request.url()) && console.log('>>', request.method(), request.url()));
	// page.on('response', response => !ignoreUrl(response.url()) && console.log('<<', response.status(), response.url()));

	//start at HIV national
	await page.goto('http://localhost:3000/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence');

	// click state of Mass.
	await page.locator('path:nth-child(48)').click();

	// Confirm correct madlib setting includes FIPS for state of Mass.
	await expect(page).toHaveURL(/.*mls=1.hiv-3.25/);

	// back button should take you back to National report
	await page.goBack()
	await expect(page).toHaveURL(/.*mls=1.hiv-3.00/);
})



test('Clicking a county on state map loads county report; back button returns to state', async ({ page }) => {

	//start at Prison & poverty in Georgia, by race
	await page.goto('http://localhost:3000/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison');

	// click on a county
	await page.locator('path:nth-child(67)').click();

	// Confirm correct madlib setting includes FIPS for county
	// TODO: re-enable once #2338 merged
	// await expect(page).toHaveURL(/.*mls=1.incarceration-3.poverty-5.13083/);

	// back button should take you back to state report
	// TODO: re-enable once weird bug figured out
	// await page.goBack()

	// TODO Fix this! Somehow additional entries are being added to the browser history so the back button doesnt work after hitting the county report
	// await expect(page).toHaveURL(/.*mls=1.incarceration-3.poverty-5.13/);
})


test('Clear selections button from Compare Topics mode returns tracker to default state', async ({ page }) => {
	// start at tracker default page (implicit default params)
	await page.goto('http://localhost:3000/exploredata');

	// choose sample compare mode report
	await page.getByRole('link', { name: 'Prison & poverty in Georgia, by race' }).click();

	// clear topic
	await page.getByRole('button', { name: 'Poverty', exact: true }).click();
	await page.getByRole('link', { name: 'Clear selections' }).click();

	// should return to default page (with explicit params)
	await expect(page).toHaveURL('http://localhost:3000/exploredata');

});