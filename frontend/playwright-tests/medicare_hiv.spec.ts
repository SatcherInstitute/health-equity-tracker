import { test } from '@playwright/test'

test('PHRMA HIV conditions and medication adherence', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_hiv-3.00&group1=All&dt1=medicare_hiv',
  )

  await page.getByText('Investigate rates of', { exact: true }).click()

  await page.locator('#rate-map').getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Rates of HIV diagnoses in the United States',
    })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Medicare beneficiaries' })
    .click()

  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Rates of HIV diagnoses in the United States',
    })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Medicare beneficiaries' })
    .click()
  await page
    .locator('#rate-chart')
    .getByText('Sources: Medicare Administrative Data')
    .click()

  await page
    .locator('#unknown-demographic-map')
    .getByRole('heading', {
      name: 'Share of total HIV incidence with unknown race and ethnicity in the United States',
    })
    .click()

  await page
    .locator('#unknown-demographic-map')
    .getByText(
      '% of beneficiary pop. diagnosed with HIV reported an unknown race or ethnicity in the United States overall. This map displays data for cases where either race or ethnicity was unknown.',
    )
    .click()

  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', {
      name: 'Share of beneficiary population vs. share of total HIV diagnoses in the United States',
    })
    .click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'Medicare beneficiaries' })
    .click()
  await page
    .locator('#population-vs-distribution')
    .getByText('View methodology.')
    .click()

  await page
    .locator('#data-table')
    .getByRole('heading', {
      name: 'Summary for HIV cases in the United States',
    })
    .click()
  await page
    .locator('#data-table')
    .getByRole('heading', { name: 'Medicare beneficiaries' })
    .click()
  await page.locator('#data-table').getByLabel('Card export options').click()
  await page.locator('.MuiBackdrop-root').first().click()

  await page
    .getByRole('combobox', { name: 'Demographic Race/ethnicity' })
    .click()
  await page.getByRole('option', { name: 'Subsidy' }).click()
  await page.getByRole('combobox', { name: 'Demographic Subsidy' }).click()
  await page.getByRole('option', { name: 'Eligibility' }).click()

  await page.locator('#rate-map').getByText('Medicare eligibility:').hover()
  await page
    .locator('#unknown-demographic-map')
    .getByRole('heading', {
      name: 'Share of total HIV incidence with unknown eligibility in the United States',
    })
    .click()
  await page.getByRole('cell', { name: 'Eligible due to age' }).click()
})
