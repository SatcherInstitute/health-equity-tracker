import { test } from '@playwright/test'

test('Depression Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.depression-3.00&group1=All')
  await page
    .getByLabel(
      'Map showing Depression in the United States : including data from 50 states/territories'
    )
    .getByRole('img')
  await page.getByRole('button', { name: 'Expand state/territory rate' }).click();
  await page
    .getByLabel(
      'Bar Chart showing Depression in the United States, by Race and Ethnicity'
    )
    .getByRole('img')
    .click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('heading', {
      name: 'Share of total adult depression cases with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/t'
    )
    .click()
})
