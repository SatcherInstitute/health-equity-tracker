import { test } from '@playwright/test'

test('Preventable Hospitalizations', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.preventable_hospitalizations-3.00&group1=All'
  )
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
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
    .getByText('See the states/territories with the highest and lowest rates.')
    .click()
  await page
    .getByText(
      'Consider the possible impact of data reporting gaps when interpreting the highest and lowest rates.'
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
      name: 'Share of all preventable hospitalizations with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/territory level.'
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
      name: 'Breakdown summary for preventable hospitalizations in the United States',
    })
    .click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Social Determinants of Health').click()
  await page
    .locator('#definitionsList')
    .getByText('Preventable hospitalizations')
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page
    .getByText('Unfortunately there are crucial data missing in our sources.')
    .click()
  await page
    .getByRole('heading', { name: 'Missing and misidentified people' })
    .click()
  await page
    .getByRole('heading', { name: "Missing America's Health Rankings data" })
    .click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love to hear from you!'
    )
    .click()
})
