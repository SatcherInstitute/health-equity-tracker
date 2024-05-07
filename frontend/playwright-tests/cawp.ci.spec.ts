import { test } from '@playwright/test'

test('CAWP: Congress', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.women_in_gov-3.00&group1=All'
  )
  await page.getByRole('button', { name: 'Expand state/territory rate' }).click();
  await page.getByText('U.S. Virgin Islands,').click()
  await page.getByText('U.S. Virgin Islands,').click()
  await page.getByText('Puerto Rico,').click()
  await page.getByText('American Samoa,').click()
  await page.getByText('District of Columbia', { exact: true }).click()
  await page.getByLabel('Include All women').click()
  await page.getByText('Expand rates over time table').click()
  await page.getByRole('cell', { name: '1951' }).click()
  await page.getByRole('cell', { name: '1952' }).click()

  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/t'
    )
    .click()
  await page
    .locator('#inequities-over-time')
    .getByLabel('Include Black or African American women')
    .click()
  await page.getByText('Expand inequities over time table').click()
  await page
    .getByRole('columnheader', {
      name: 'Black or African American women % relative inequity',
    })
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total women in US congress in the United States'
    )
    .getByRole('img')
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total women in US congress in the United States'
    )
    .getByText('7.1% of women members', { exact: true })
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total women in US congress in the United States'
    )
    .getByText('20.0% of women members', { exact: true })
    .click()


  await page.getByRole('button', { name: 'US Congress', exact: true }).click();
  await page.getByRole('button', { name: 'State legislatures' }).click();
  await page.getByRole('button', { name: 'Population vs. distribution' }).click();
  // ensure CAWP specific alert is visible
  await page.getByText('Percentages reported for Women in state legislatures cannot be summed, as these ').click();

})


test('CAWP: State Legislature', async ({ page }) => {
  await page.goto('/exploredata?mls=1.women_in_gov-3.00&group1=All');
  await page.getByRole('button', { name: 'US Congress', exact: true }).click();
  await page.getByRole('button', { name: 'State legislatures' }).click();
  await page.getByLabel('Race and Ethnicity:').click();
  await page.getByRole('button', { name: 'Black or African American' }).click();
  await page.locator('#rate-map').getByRole('heading', { name: 'Percentage of state' }).click();
  await page.getByRole('heading', { name: 'Black or African American' }).click();
  await page.getByLabel('Click for more info on Women').click();
  await page.getByRole('heading', { name: 'Women in state legislatures' }).click();
  await page.getByText('Women in state legislaturesMeasurement Definition: Individuals identifying as').click();
  await page.getByLabel('close topic info modal').click();
  await page.getByRole('heading', { name: 'Rates of women in state' }).click();
  await page.getByText('% women in state legislature →').click();
  await page.getByLabel('View the share of Women in').click();
  await page.getByText('Missing and unknown data').click();
  await page.locator('#rate-chart').getByRole('heading', { name: 'Percentage of state' }).click();
  await page.getByRole('heading', { name: 'Percent share of women state' }).click();
  await page.getByRole('button', { name: 'Inequities over time' }).click();
  await page.locator('#inequities-over-time').getByLabel('Include Latinas and Hispanic').click();
  await page.locator('#inequities-over-time').getByLabel('Include Latinas and Hispanic').click();
  await page.getByText('This graph visualizes the').click();
  await page.getByRole('heading', { name: 'Population vs. distribution' }).click();
  await page.getByText('Percentages reported for').click();
  await page.getByRole('heading', { name: 'Breakdown summary for Women' }).click();
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click();
  await page.getByRole('columnheader', { name: 'Percentage of women state' }).click();
  await page.getByRole('columnheader', { name: 'Percent share of women state' }).click();
  await page.getByRole('columnheader', { name: 'Total population share (all' }).click();
  await page.getByText('Share this report:').click();
  await page.getByText('Political Determinants of').click();
  await page.getByRole('combobox', { name: 'Demographic Race/ethnicity' }).click();
  await page.getByLabel('Age unavailable for Women in').click();
  await page.getByLabel('Sex unavailable for Women in').click();
});