import { test } from '@playwright/test'

test('Preventable Hospitalizations', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.preventable_hospitalizations-3.00&group1=All',
  )
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Preventable hospitalizations in the United States',
    })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Medicare beneficiaries' })
    .click()
  await page
    .getByRole('button', { name: 'Expand state/territory rate' })
    .click()
  await page
    .getByText(
      'Consider the possible impact of data reporting gaps when interpreting the highest and lowest rates.',
    )
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Preventable hospitalizations in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Share of all preventable hospitalizations with unknown race/ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race/ethnicity reported in this dataset at the state/territory level.',
    )
    .click()
  await page
    .getByRole('heading', {
      name: 'Graph unavailable: Population vs. distribution of total preventable hospitalizations in the United States',
    })
    .click()
  await page
    .locator('#population-vs-distribution')
    .getByText('race and ethnicity')
    .click()
  await page
    .getByRole('heading', {
      name: 'Summary for preventable hospitalizations in the United States',
    })
    .click()
  await page.getByRole('button', { name: 'Definitions & missing data' }).click()

  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByRole('heading', { name: 'Social Determinants of' }).click()
  await page
    .locator('#definitionsList')
    .getByText('Preventable hospitalizations', { exact: true })
    .click()
  await page.getByText('Measurement Definition:').click()
  await page
    .getByText(
      'Measurement Definition: Discharges following hospitalization for diabetes with',
    )
    .click()
  await page.getByText('Clinical Importance:').click()
  await page.getByText('Clinical Importance: Studying').click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Unfortunately there are').click()
  await page.getByRole('heading', { name: 'Missing and misidentified' }).click()
  await page.getByText('Native Hawaiian and Pacific').click()
  await page.getByRole('heading', { name: "Missing America's Health" }).click()
  await page.getByText('Population data:').click()
  await page.getByText('Population data: AHR does not').click()
})
