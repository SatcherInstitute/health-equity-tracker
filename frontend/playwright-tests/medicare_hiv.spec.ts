import { test } from '@playwright/test'

test('PHRMA HIV conditions and medication adherence', async ({ page }) => {
  await page.goto('/exploredata?mls=1.medicare_hiv-3.00&group1=All')

  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Population adherent to' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Medicare ARV Beneficiaries,' })
    .click()
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Total population of Medicare' })
    .click()
  await page
    .getByText(
      'Adherence to antiretroviral medications: Pharmacy Quality Alliance measure',
    )
    .click()
  await page.getByRole('button', { name: 'Rate chart' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Population adherent to' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Medicare ARV Beneficiaries,' })
    .click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for adherence to' }).click()
  await page.getByRole('columnheader', { name: 'Race/Ethnicity' }).click()
  await page
    .getByRole('columnheader', { name: '% of pop. above adherence' })
    .click()
  await page.getByRole('columnheader', { name: '% of adherent pop.' }).click()
  await page.getByRole('button', { name: 'Definitions & missing data' }).click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page
    .getByRole('heading', { name: 'Medication Utilization in the' })
    .click()
  await page
    .getByText('Adherence to antiretroviral medications', { exact: true })
    .click()
  await page.getByText('New HIV diagnoses').click()
  await page
    .getByRole('button', {
      name: 'Adherence to Antiretroviral Medications',
      exact: true,
    })
    .click()
  await page.getByText('HIV Cases').click()
  await page.getByRole('button', { name: 'Rate map' }).click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Rates of HIV diagnoses in the' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Medicare beneficiaries, Ages' })
    .click()
  await page.getByRole('img', { name: 'Map showing Rates of HIV' }).click()
})
