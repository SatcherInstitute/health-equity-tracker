import { test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=ras_antagonists_adherence'
  )
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Population adherent to RAS-Antagonists in the United States',
    })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Demographic', { exact: true }).nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', {
      name: 'Population adherent to RAS-Antagonists in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Adherent beneficiary population with unknown race and ethnicity in the United States',
    })
    .click()
  await page
    .getByRole('heading', {
      name: 'Breakdown summary for adherence to renin angiotensin system antagonists in the United States',
    })
    .click()
  await page.getByText('Share this report:').click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page
    .getByText('Medication Utilization in the Medicare Population')
    .click()
  await page.getByText('Adherence to RASA', { exact: true }).click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page
    .getByText(
      'Do you have information that belongs on the Health Equity Tracker? We would love'
    )
    .click()
})
