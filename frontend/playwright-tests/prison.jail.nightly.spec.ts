import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/exploredata?mls=1.incarceration-3.00&group1=All');

  await page.getByRole('button', { name: 'Prison', exact: true }).click();
  await page.getByRole('button', { name: 'Jail' }).click();
  await page.getByLabel('open the topic info modal').click();
  await page.getByLabel('close topic info modal').click();
  await page.locator('#rate-map').getByRole('heading', { name: 'Jail incarceration in the United States' }).click();
  await page.getByText('See the states/territories with the highest and lowest rates.').click();
  await page.getByRole('heading', { name: '5 Highest:' }).click();
  await page.getByRole('heading', { name: 'National overall:' }).click();
  await page.getByText('Jail incarceration', { exact: true }).click();
  await page.getByRole('heading', { name: 'Graph unavailable: Rates of jail incarceration over time in the United States' }).click();
  await page.locator('#madlib-box').getByRole('button', { name: 'United States' }).click();
  await page.locator('#mui-53').fill('den');
  await page.getByRole('option', { name: 'Denver County, Colorado' }).click();
  await page.getByRole('heading', { name: 'Rates of jail incarceration over time in Denver County, Colorado' }).click();
  await page.getByText('Expand rates over time table').click();
  await page.getByRole('columnheader', { name: 'Time period (1970 - 2018)' }).click();
  await page.getByRole('columnheader', { name: 'Black or African American (NH) jail per 100k' }).click();
  await page.locator('#rate-chart').getByRole('note').click();
  await page.getByText('No unknown values for race and ethnicity reported in this dataset.').click();
  await page.getByText('This graph visualizes the disproportionate share of People in jail as experience').click();
  await page.getByRole('heading', { name: 'Population vs. distribution of total people in jail in Denver County, Colorado' }).click();
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click();
  await page.getByRole('columnheader', { name: 'People in jail per 100k' }).click();
  await page.getByRole('columnheader', { name: 'Percent share of total jail population' }).click();
  await page.getByRole('columnheader', { name: 'Total population share' }).click();
  await page.getByText('Individuals of any age, including children, under the jurisdiction of an adult p').click();
  await page.getByRole('button', { name: 'Jail', exact: true }).click();
  await page.getByRole('button', { name: 'Prison' }).click();
  await page.getByLabel('open the topic info modal').click();
});