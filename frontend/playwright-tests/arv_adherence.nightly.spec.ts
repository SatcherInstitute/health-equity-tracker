import { test } from '@playwright/test'

test('ARV Adherence', async ({ page }) => {
  await page.goto('/exploredata?mls=1.medicare_hiv-3.00&group1=All')
  await page.getByText('Investigate rates of', { exact: true }).click()
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Population adherent to antiretrovirals in the United States',
    })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Medicare ARV Beneficiaries, Ages 18+' })
    .click()
  await page.getByText('Demographic', { exact: true }).nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Population adherent to antiretrovirals in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Adherent beneficiary population with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Summary for adherence to antiretrovirals in the United States',
    })
    .click()
  await page.getByText('Share this report:').click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page
    .getByText('Adherence to antiretroviral medications', { exact: true })
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love',
    )
    .click()
})
