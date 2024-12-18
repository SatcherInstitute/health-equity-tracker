import { test } from '@playwright/test'

test.setTimeout(120000)

test('Chronic Kidney Disease', async ({ page }) => {
  await page.goto('/exploredata?mls=1.chronic_kidney_disease-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Chronic kidney disease in the' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByRole('heading', { name: 'Cases of chronic kidney' }).click()
  await page.getByRole('dialog').getByText('Measurement Definition:').click()
  await page.getByText('For specific calculations and')
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Chronic kidney disease in the' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of all chronic kidney' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for cases' }).click()
  await page.getByText('Share this report:').click()
  await page
    .getByText('Cases of chronic kidney disease', { exact: true })
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Do you have information that').click()
})
