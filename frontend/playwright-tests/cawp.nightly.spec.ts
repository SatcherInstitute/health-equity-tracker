import { test } from '@playwright/test'

test('CAWP: CAWP National Congress Flow', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.women_in_gov-3.00&group1=All'
  )
  await page
    .getByText('See the states/territories with the highest and lowest rates.')
    .click()
  await page.getByText('U.S. Virgin Islands,').click()
  await page.getByText('U.S. Virgin Islands,').click()
  await page.getByText('Puerto Rico,').click()
  await page.getByText('American Samoa,').click()
  await page.getByText('District of Columbia', { exact: true }).click()
  await page.getByText('United States: 25%').click()
  await page.getByLabel('Include All women').click()
  await page.getByText('Expand rates over time table').click()
  await page.getByRole('cell', { name: '1951' }).click()
  await page
    .getByRole('row', { name: '1951 2%' })
    .getByRole('cell')
    .nth(1)
    .click()
  await page.getByRole('cell', { name: '1952' }).click()
  await page
    .getByRole('row', { name: '1952 2%' })
    .getByRole('cell')
    .nth(1)
    .click()
  await page.getByRole('cell', { name: '2023' }).click()
  await page.getByRole('cell', { name: '25%' }).nth(1).click()
  await page
    .getByLabel(
      'Bar Chart showing Current rates of US Congress members identifying as women in the United States, by Race and Ethnicity'
    )
    .getByText('5%', { exact: true })
    .click()
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

  await page
    .getByRole('cell', {
      name: '25% women in Congress ( 155 members / 621 Total members )',
    })
    .click()
  await page.getByRole('button', { name: 'US Congress', exact: true }).click();
  await page.getByRole('button', { name: 'State legislatures' }).click();
  await page.getByRole('button', { name: 'Population vs. distribution' }).click();
  await page.getByText('Percentages reported for Women in state legislatures cannot be summed, as these ').click();

})
