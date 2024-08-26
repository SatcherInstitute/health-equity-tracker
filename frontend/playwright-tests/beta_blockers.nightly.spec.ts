import { test } from '@playwright/test'

test('Beta Blockers Adherence', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=beta_blockers_adherence',
  )
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Population adherent to beta blockers in the United States',
    })
    .click()
  await page.getByText('Demographic', { exact: true }).nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .getByText(
      'Adherence to beta blockers: Pharmacy Quality Alliance measure representing the p',
    )
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Population adherent to beta blockers in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Adherent beneficiary population with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Summary for adherence to beta blockers in the United States',
    })
    .click()
  await page.locator('div:nth-child(8)').first().click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Adherence to beta blockers', { exact: true }).click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love',
    )
    .click()
})
