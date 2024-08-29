import { test } from '@playwright/test'

test('calcium channel blocker adherence', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&dt1=ccb_adherence',
  )
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Population adherent to' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Demographic', { exact: true }).nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Population adherent to' })
    .click()
  await page.getByRole('heading', { name: 'Adherent beneficiary' }).click()
  await page.getByRole('heading', { name: 'Summary for' }).click()
  await page.getByText('Share this report:').click()
  await page
    .getByText('Adherence to calcium channel blockers', { exact: true })
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Do you have information that').click()
})
