import { test } from '@playwright/test'

test('Statin Adherence', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=statins_adherence'
  )
  await page.locator('#landingPageCTA').click()
  await page.getByRole('button', { name: 'select a topic' }).click()
  await page
    .getByRole('button', {
      name: 'Cardiovascular Conditions and Medication Adherence',
    })
    .click()
  await page
    .getByRole('button', {
      name: 'Persistence of Beta Blocker Treatment after a Heart Attack',
    })
    .click()
  await page.getByRole('button', { name: 'Adherence to Statins' }).click()
  await page.getByLabel('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .getByRole('combobox', { name: 'Demographic Race/ethnicity' })
    .click()
  await page.getByRole('option', { name: 'Sex' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Population adherent to statins in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Adherent beneficiary population with unknown sex in the United States',
    })
    .click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Adherence to statins', { exact: true }).click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love'
    )
    .click()
})
