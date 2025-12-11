import { test } from '@playwright/test'

test('RAS Antagonists', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=ras_antagonists_adherence',
  )
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Population adherent to RAS-Antagonists in the United States',
    })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Population adherent to RAS-Antagonists in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Adherent beneficiary population with unknown race/ethnicity in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Summary for adherence to renin angiotensin system antagonists in the United States',
    })
    .click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page.getByText('Share this report:').click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page
    .getByText('Medication Utilization in the Medicare Population')
    .click()
  await page.getByText('Adherence to RASA', { exact: true }).click()
})
