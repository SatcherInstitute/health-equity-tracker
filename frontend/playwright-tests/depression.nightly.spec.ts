import { test } from '@playwright/test'

test('Depression Flow', async ({ page }) => {
  await page.goto(
    'https://healthequitytracker.org/exploredata?mls=1.depression-3.00&group1=All'
  )
  await page
    .getByLabel(
      'Map showing Depression in the United States : including data from 50 states/territories'
    )
    .getByRole('img')
  await page
    .getByText('See the states/territories with the highest and lowest rates.')
    .click()
  await page
    .getByLabel(
      'Bar Chart showing Depression in the United States, by Race and Ethnicity'
    )
    .getByRole('img')
    .click()
  await page
    .getByRole('heading', {
      name: 'Share of total depression cases with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/t'
    )
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total depression cases in the United States'
    )
    .getByRole('img')
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total depression cases in the United States'
    )
    .getByText('1.1% of cases', { exact: true })
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total depression cases in the United States'
    )
    .getByText('2.9% of cases', { exact: true })
    .click()
  await page
    .getByRole('figure', {
      name: 'Breakdown summary for depression cases in the United States',
    })
    .click()
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click()
  await page
    .getByRole('columnheader', { name: 'Cases of depression per 100k adults' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Share of total depression cases' })
    .click()
  await page.getByRole('columnheader', { name: 'Population share' }).click()
})
