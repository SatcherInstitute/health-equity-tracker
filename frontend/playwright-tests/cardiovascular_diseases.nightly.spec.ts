import { test } from '@playwright/test'

test('Cardiovascular Diseases', async ({ page }) => {
  await page.goto('/exploredata?mls=1.cardiovascular_diseases-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Cardiovascular diseases in the United States',
    })
    .click()
  await page
    .getByRole('combobox', { name: 'Demographic Race/ethnicity' })
    .click()
  await page.locator('#menu- div').first().click()
  await page.getByText('Compare mode').nth(2).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Cardiovascular diseases in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Share of all cases of cardiovascular diseases with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Population vs. distribution of total adult cases of cardiovascular diseases in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Summary for cardiovascular disease in the United States',
    })
    .click()
  await page
    .getByRole('columnheader', {
      name: 'Cases of cardiovascular diseases per 100k adults',
    })
    .click()
  await page.getByText('Share this report:').click()
  await page
    .getByText('Cases of cardiovascular diseases', { exact: true })
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love',
    )
    .click()
})
