import { test } from '@playwright/test'

test('HIV Black Women: Prevalance Top Cards', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_black_women-3.00')
  await page.getByLabel('Age:').click()
  await page.getByRole('button', { name: '+' }).click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'HIV prevalence for Black (NH' })
    .click()
  await page.getByRole('heading', { name: 'Ages 65+' }).click()
  await page
    .getByRole('button', { name: 'Rates over time', exact: true })
    .click()
  await page
    .getByRole('heading', {
      name: 'HIV prevalence for Black (NH) women over time in the United States',
    })
    .click()
  await page.getByLabel('Include 65+').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'HIV prevalence for Black (NH' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Ages 13+' })
    .click()
})

test('HIV Black Women: Prevalance Bottom Cards', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_black_women-3.00')

  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page.locator('#inequities-over-time').getByLabel('Include 55+').click()
  await page.getByText('disproportionately high →').click()
  await page
    .getByRole('button', { name: 'Expand inequities over time table' })
    .click()
  await page.getByText('Add or remove columns by').click()
  await page
    .getByRole('columnheader', { name: 'Ages 55+ % relative inequity' })
    .click()
  await page.getByRole('caption').click()

  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'Ages 13+' })
    .click()
  await page
    .getByText(
      'Black or African-American (NH) women ages 13+ living with HIV (diagnosed &',
    )
    .click()
  await page
    .getByRole('button', { name: 'Prevalence for Black Women', exact: true })
    .click()
  await page
    .getByRole('menuitem', { name: 'New Diagnoses for Black Women' })
    .click()
  await page
    .getByRole('heading', { name: 'Missing data for HIV deaths,' })
    .click()
  await page.getByText('County-level data is').click()
  await page.getByText('To protect personal privacy,').click()
})

test('HIV Black Women: Diagnoses', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.hiv_black_women-3.00&group1=All&dt1=hiv_diagnoses_black_women',
  )
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'New HIV diagnoses for Black (' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Ages 13+' })
    .click()
  await page
    .getByRole('button', { name: 'New Diagnoses for Black Women' })
    .click()
  await page.getByRole('menuitem', { name: 'Deaths for Black women' }).click()
})

test('HIV Black Women: Deaths', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.hiv_black_women-3.00&group1=All&dt1=hiv_deaths_black_women',
  )
  await page
    .locator('#rates-over-time')
    .getByRole('heading', { name: 'Rates of HIV deaths for Black' })
    .click()
  await page
    .getByRole('button', { name: 'Expand rates over time table' })
    .click()
  await page.getByRole('columnheader', { name: 'All deaths per 100k' }).click()

  await page.getByRole('button', { name: 'Definitions & missing data' }).click()
  await page.getByText('New HIV diagnoses for Black').click()
  await page
    .getByText(
      'Black or African-American (NH) women ages 13+ diagnosed with HIV in a',
    )
    .click()
  await page.getByText('HIV deaths for Black women', { exact: true }).click()
  await page
    .getByText(
      'Black or African-American (NH) women ages 13+ who died from HIV or AIDS in a',
    )
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Currently, there are no').click()
  await page
    .getByRole('heading', { name: 'Missing data for HIV deaths,' })
    .click()
  await page.getByText("There isn't enough data to").click()
  await page.getByText('The Asian category includes').click()
})
