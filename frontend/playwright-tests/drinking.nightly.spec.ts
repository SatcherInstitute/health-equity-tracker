import { test } from '@playwright/test'

test('Excessive Drinking Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.excessive_drinking-3.00&group1=All')
  await page
    .getByLabel(
      'Map showing Excessive drinking cases in the United States : including data from 50 states/territories'
    )
    .getByRole('img')
  await page.getByRole('button', { name: 'Expand state/territory rate' }).click();
  await page.getByRole('heading', { name: 'Highest:' }).click()
  await page.getByRole('heading', { name: 'Lowest:' }).click()
  await page.getByRole('heading', { name: 'National overall:' }).click()
  await page
    .locator('#extremes')
    .getByText('Excessive drinking cases')
    .click()
  await page.getByText('Consider the possible impact').click()
  await page.getByRole('button', { name: 'Collapse state/territory rate' }).click();
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('heading', {
      name: 'Share of all adult excessive drinking cases with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/t'
    )
    .click()
  await page
    .getByRole('heading', {
      name: 'Population vs. distribution of total adult excessive drinking cases in the United States',
    })
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total adult excessive drinking cases in the United States'
    )
    .getByRole('img')
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total adult excessive drinking cases in the United States'
    )
    .getByText('3.8% of all cases', { exact: true })
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total adult excessive drinking cases in the United States'
    )
    .getByText('1.5% of all cases', { exact: true })
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total adult excessive drinking cases in the United States'
    )
    .getByText('64.5% of all cases', { exact: true })
    .click()
  await page
    .getByRole('heading', {
      name: 'Breakdown summary for excessive drinking cases in the United States',
    })
    .click()
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click()
  await page
    .getByRole('columnheader', {
      name: 'Excessive drinking cases per 100k adults',
    })
    .click()
  await page
    .getByRole('columnheader', {
      name: 'Share of all adult excessive drinking cases',
    })
    .click()
  await page.getByRole('columnheader', { name: 'Population share' }).click()
})
