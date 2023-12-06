import { test, expect } from '@playwright/test';

test('Incarceration (Prison and Jail) User Flow', async ({ page }) => {
  //  PRISON BY RACE
  await page.goto('/exploredata?mls=1.incarceration-3.00&group1=All');
  await page.getByLabel('Launch multiple maps view with side-by-side maps of each race and ethnicity group').click();
  await page.getByLabel('close multiple maps modal').click();
  await page.getByRole('button', { name: 'Rates over time' }).click();
  await page.getByText('Our data sources do not have historical data for Prison incarceration broken dow').click();
  await page.getByRole('button', { name: 'Unknown demographic map' }).click();
  await page.locator('#unknown-demographic-map').getByText('0.4% of prison pop. reported an unknown race or ethnicity in the United States. ').click();
  await page.getByRole('heading', { name: 'Population vs. distribution of total people in prison in the United States' }).click();
  await page.getByRole('button', { name: 'Data table' }).click();
  await page.getByRole('columnheader', { name: 'Total population share' }).click();
  //  PRISON BY SEX
  await page.getByRole('combobox', { name: 'Demographic Race/ethnicity' }).click();
  await page.getByRole('option', { name: 'Sex' }).click();
  await page.getByText('Individuals of any age, including children, under the jurisdiction of an adult p').click();
  await page.locator('#data-table').getByText('3,232 children confined in adult facilities in the United States. Learn more.').click();
  await page.getByRole('cell', { name: 'Female' }).click();
  await page.getByText('Off').nth(1).click();
  // JAIL BY SEX
  await page.getByRole('option', { name: 'Topics' }).click();
  await page.getByRole('button', { name: 'COVID-19', exact: true }).click();
  await page.getByRole('button', { name: 'Incarceration' }).click();
  await page.getByRole('button', { name: 'Prison' }).nth(1).click();
  await page.getByRole('button', { name: 'Jail' }).click();
  await page.locator('#rate-map2 > .rounded > div:nth-child(3) > .MuiCardContent-root > div > div:nth-child(2) > div > .MuiGrid-root > .vega-embed > .marks > g > .mark-group > g > g > g:nth-child(3) > path:nth-child(12)').click();
  await page.locator('path:nth-child(51)').click();
  await page.locator('#rates-over-time2').getByText('rates over time').click();
  await page.getByRole('cell', { name: '1970' }).click();
  await page.getByRole('columnheader', { name: 'Time period (1970 - 2018)' }).click();
  await page.getByRole('cell', { name: '2018' }).click();
  await page.getByText('Rates of jail incarceration over time in Yazoo County, Mississippi by sex').click();
  await page.getByRole('heading', { name: 'Percent share of total jail population with unknown sex in Yazoo County, Mississippi' }).click();
  await page.locator('#unknown-demographic-map2').getByText('No unknown values for sex reported in this dataset.').click();
  await page.locator('#data-table2').getByText('2 children confined in adult facilities in Yazoo County, Mississippi. Learn more').click();
  await page.getByText('Individuals of any age, including children, under the jurisdiction of an adult').click();
  await page.getByText('People in jail', { exact: true }).click();
  await page.getByText('Individuals of any age, including children, confined in a local, adult jail').click();
  await page.getByLabel('open the topic info modal').click();
  await page.getByRole('heading', { name: 'People in prison' }).click();
  await page.getByRole('heading', { name: 'People in jail' }).click();
});