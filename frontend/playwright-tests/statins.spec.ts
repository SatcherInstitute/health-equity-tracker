import { test } from '@playwright/test'

test('Statin Adherence', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=statins_adherence',
  )
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Population adherent to statins in the United States',
    })
    .click()
  await page.getByText('Compare mode').nth(2).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Population adherent to statins in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Adherent beneficiary population with unknown race/ethnicity in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Summary for adherence to statins in the United States',
    })
    .click()
  await page.locator('#data-table').getByLabel('Card export options').click()
  await page.locator('.MuiBackdrop-root').first().click()
  await page.getByText('Share this report:').click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Adherence to statins', { exact: true }).click()
})
