import { test } from '@playwright/test'

test('Voter Participation Flow', async ({ page }) => {
  await page.goto(
    'https://healthequitytracker.org/exploredata?mls=1.voter_participation-3.00&group1=All'
  )
  await page
    .getByLabel(
      'Map showing Voter participation in the United States : including data from 51 states/territories'
    )
    .getByRole('img')
  await page
    .getByText('See the states/territories with the highest and lowest rates.')
    .click()
  await page
    .getByLabel(
      'Bar Chart showing Voter participation in the United States, by Race and Ethnicity'
    )
    .getByRole('img')
    .click()
  await page.getByText('67%', { exact: true }).click()
  await page
    .getByRole('heading', {
      name: 'Share of all voter participation with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/t'
    )
    .click()
  await page
    .getByRole('heading', {
      name: 'Graph unavailable: Population vs. distribution of total voter participation in the United States',
    })
    .click()
  await page
    .getByText(
      'Our data sources do not have Population vs. distribution of total voter particip'
    )
    .click()
  await page
    .getByRole('heading', {
      name: 'Breakdown summary for voter participation in the United States',
    })
    .click()
  await page
    .getByRole('figure', {
      name: 'Breakdown summary for voter participation in the United States',
    })
    .click()
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click()
  await page
    .getByRole('columnheader', { name: 'Voter Participation', exact: true })
    .click()
  await page
    .getByRole('columnheader', { name: 'Share of all voter participation' })
    .click()
  await page.getByRole('columnheader', { name: 'Population share' }).click()
})
