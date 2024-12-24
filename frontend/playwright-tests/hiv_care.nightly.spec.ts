import { test } from '@playwright/test'

test('HIV Linkage To Care', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_care-3.00&group1=All')
  await page
    .getByRole('button', { name: 'Race/Ethnicity', exact: true })
    .click()
  await page.getByRole('menuitem', { name: 'Age' }).click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Linkage to HIV care in the' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Ages 13+' })
    .click()
  await page.getByLabel('Age:').click()
  await page.getByRole('button', { name: '-24' }).click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Linkage to HIV care in the' })
    .click()
  await page.getByRole('heading', { name: 'Ages 13-' }).click()
  await page
    .getByRole('heading', {
      name: 'Rates of linkage to HIV care over time in the United States',
    })
    .click()
  await page.getByLabel('Include All').click()
  await page.getByLabel('Include 13-').click()
  await page
    .getByRole('button', { name: 'Expand rates over time table' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Time period (2017 - 2021)' })
    .click()
  await page.getByRole('columnheader', { name: 'All % linkage' }).click()
  await page.getByRole('columnheader', { name: 'Ages 13-24 % linkage' }).click()
  await page.getByText('Add or remove columns by').click()
  await page.getByRole('button', { name: 'Collapse rates over time' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Linkage to HIV care in the' })
    .click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('heading', { name: 'Share of total linkage to HIV' })
    .click()
  await page
    .locator('#unknown-demographic-map')
    .getByRole('heading', { name: 'Ages 13+' })
    .click()
  await page.getByText('No unknown values for age').click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page.locator('#inequities-over-time').getByLabel('Include 13-').click()
  await page.getByText('← disproportionately low').click()
  await page
    .getByRole('button', { name: 'Expand inequities over time table' })
    .click()
  await page.getByText('Add or remove columns by').click()
  await page
    .getByRole('columnheader', { name: 'Time period (2017 - 2021)' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Ages 13-24 % relative inequity' })
    .click()
  await page
    .getByText(
      'Historical relative inequity in linkage to HIV care in the United States by age',
    )
    .click()
  await page
    .locator('#inequities-over-time')
    .getByText("Due to COVID-19's effects on")
    .click()
  await page.getByText('This graph visualizes the').click()
  await page.getByRole('heading', { name: 'Diagnosed population vs.' }).click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'Ages 13+' })
    .click()
  await page.getByRole('button', { name: 'Data table', exact: true }).click()
  await page.getByRole('heading', { name: 'Summary for linkage' }).click()
  await page
    .getByRole('figure', { name: 'Summary for linkage' })
    .locator('h4')
    .click()
  await page.getByRole('columnheader', { name: 'Age', exact: true }).click()
  await page.getByRole('cell', { name: 'All' }).click()
  await page.getByRole('cell', { name: '+' }).click()
  await page
    .getByRole('columnheader', { name: 'Linkage to HIV care', exact: true })
    .click()
  await page
    .getByRole('columnheader', { name: 'Share of total linkage to HIV' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Diagnosed population share (' })
    .click()
})
