import { test } from '@playwright/test';

test('Covid Hospitalizations Flow', async ({ page }) => {

	await page.goto('https://healthequitytracker.org/exploredata?mls=1.covid-3.00&dt1=covid_hospitalizations');
	await page.locator('#rate-map').getByRole('heading', { name: 'Rates of COVID-19 hospitalizations since Jan 2020 in the United States' }).click();
	await page.getByText('Expand rates over time table').click();

	/*
	TODO: MANUALLY UPDATE
	this will generally be the month before the month in which new data is released. This ensures the backend source data has been uploaded and processed properly on the PROD account
	*/
	await page.getByRole('cell', { name: 'October 2023' }).click();
	const page1Promise = page.waitForEvent('popup');

	/*
	TODO: MANUALLY UPDATE
	this will generally be the month the newest data has been released by the CDC. This ensure the frontend React app on PROD has been updated properly
	*/
	await page.locator('#rates-over-time').getByText('CDC Case Surveillance Restricted Access Detailed Data (updated November 2023) and').click();
	const page1 = await page1Promise;
});