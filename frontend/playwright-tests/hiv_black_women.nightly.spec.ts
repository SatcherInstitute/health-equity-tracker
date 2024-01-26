import { test } from '@playwright/test';

test('HIV Black Women: Prevalance', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_black_women-3.00');
  await page.getByRole('combobox', { name: 'Demographic Age' }).click();
  await page.getByLabel('Race/Ethnicity unavailable').click();
  await page.getByLabel('Sex unavailable for').click();
  await page.getByRole('option', { name: 'Age' }).click();
  await page.getByLabel('Age:').click();
  await page.getByRole('button', { name: '+' }).click();
  await page.locator('#rate-map').getByRole('heading', { name: 'HIV prevalence for Black (NH' }).click();
  await page.getByRole('heading', { name: 'Ages 55+' }).click();
  await page.getByRole('button', { name: 'Rates over time', exact: true }).click();
  await page.getByRole('heading', { name: 'HIV prevalence for Black (NH) women over time in the United States' }).click();
  await page.getByLabel('Include 55+').click();
  await page.getByLabel('Include 55+').click();
  await page.getByText('Due to COVID-19\'s effects on').click();
  await page.locator('#rate-chart').getByRole('heading', { name: 'HIV prevalence for Black (NH' }).click();
  await page.locator('#rate-chart').getByRole('heading', { name: 'Ages 13+' }).click();
  await page.getByRole('button', { name: 'Unknown demographic map' }).click();
  await page.getByRole('heading', { name: 'Share of total HIV prevalence' }).click();
  await page.locator('#unknown-demographic-map').getByRole('heading', { name: 'Ages 13+' }).click();
  await page.getByText('No unknown values for age').click();
  await page.getByRole('heading', { name: 'Historical relative inequity' }).click();
  await page.locator('#inequities-over-time').getByLabel('Include 55+').click();
  await page.getByText('disproportionately high →').click();
  await page.getByText('← disproportionately low').click();
  await page.locator('div').filter({ hasText: /^Expand inequities over time table$/ }).nth(2).click();
  await page.getByText('Add or remove columns by').click();
  await page.getByRole('columnheader', { name: 'Time period (2008 - 2021)' }).click();
  await page.getByRole('columnheader', { name: 'Ages 55+ % relative inequity' }).click();
  await page.getByRole('caption').click();
  await page.locator('#inequities-over-time').getByText('Due to COVID-19\'s effects on').click();
  await page.getByText('This graph visualizes the').click();
  await page.getByRole('heading', { name: 'Population vs. distribution' }).click();
  await page.locator('#population-vs-distribution').getByRole('heading', { name: 'Ages 13+' }).click();
  await page.getByRole('heading', { name: 'Breakdown summary for HIV' }).click();
  await page.getByRole('figure', { name: 'Breakdown summary for HIV' }).locator('h4').click();
  await page.getByRole('columnheader', { name: 'Age', exact: true }).click();
  await page.getByRole('columnheader', { name: 'HIV prevalence for Black (NH) women per 100k people' }).click();
  await page.getByRole('columnheader', { name: 'Share of total HIV prevalence' }).click();
  await page.getByRole('columnheader', { name: 'Population share (ages 13+)' }).click();
  await page.getByRole('heading', { name: 'Definitions:' }).click();
  await page.getByText('HIV prevalence for Black women', { exact: true }).click();
  await page.getByText('Black or African-American (NH) women ages 13+ living with HIV (diagnosed &').click();
  await page.getByRole('button', { name: 'Prevalence for Black Women', exact: true }).click();
  await page.getByRole('button', { name: 'New Diagnoses for Black Women' }).click();
  await page.getByRole('heading', { name: 'Missing data for HIV deaths,' }).click();
  await page.getByText('County-level data is').click();
  await page.getByText('To protect personal privacy,').click();
  await page.getByRole('button', { name: 'New Diagnoses for Black Women' }).click();
  await page.getByRole('button', { name: 'New Diagnoses for Black Women' }).click();
  await page.getByLabel('Age:').click();
  await page.getByRole('button', { name: 'All' }).click();
})

test('HIV Black Women: Diagnoses', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_black_women-3.00&group1=All&dt1=hiv_diagnoses_black_women');
  await page.locator('#rate-map').getByRole('heading', { name: 'New HIV diagnoses for Black (' }).click();
  await page.locator('#rate-map').getByRole('heading', { name: 'Ages 13+' }).click();
  await page.getByRole('button', { name: 'New Diagnoses for Black Women' }).click();
  await page.getByRole('button', { name: 'Deaths for Black women' }).click();

})

test('HIV Black Women: Deaths', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_black_women-3.00&group1=All&dt1=hiv_deaths_black_women');
  await page.getByRole('heading', { name: 'Rates of HIV deaths for Black' }).click();
  await page.locator('div').filter({ hasText: /^Expand rates over time table$/ }).nth(2).click();
  await page.getByRole('columnheader', { name: 'Time period (2008 - 2021)' }).click();
  await page.getByRole('columnheader', { name: 'All deaths per 100k' }).click();
  await page.getByRole('columnheader', { name: 'Ages 13-24 deaths per 100k' }).click();
  await page.getByRole('columnheader', { name: 'Ages 25-34 deaths per 100k' }).click();
  await page.getByRole('columnheader', { name: 'Ages 35-44 deaths per 100k' }).click();
  await page.getByRole('columnheader', { name: 'Ages 45-54 deaths per 100k' }).click();
  await page.getByRole('columnheader', { name: 'Ages 55+ deaths per 100k' }).click();
  await page.getByRole('button', { name: 'Definitions & missing data' }).click();
  await page.getByText('New HIV diagnoses for Black').click();
  await page.getByText('Black or African-American (NH) women ages 13+ diagnosed with HIV in a').click();
  await page.getByText('HIV deaths for Black women', { exact: true }).click();
  await page.getByText('Black or African-American (NH) women ages 13+ who died from HIV or AIDS in a').click();
  await page.getByRole('heading', { name: 'What data are missing?' }).click();
  await page.getByText('Currently, there are no').click();
  await page.getByRole('heading', { name: 'Missing data for HIV deaths,' }).click();
  await page.getByText('County-level data is').click();
  await page.getByText('To protect personal privacy,').click();
  await page.getByText('There isn\'t enough data to').click();
  await page.getByText('The Asian category includes').click();
  await page.getByLabel('Scroll to Top').click();
  await page.getByLabel('open the topic info modal').click();
  await page.getByRole('heading', { name: 'HIV deaths for Black women' }).click();
  await page.getByText('HIV deaths for Black womenMeasurement Definition: Black or African-American (NH').click();
  await page.getByLabel('close topic info modal').click();
});