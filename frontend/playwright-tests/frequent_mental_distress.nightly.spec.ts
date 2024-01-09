import { test } from '@playwright/test'

test('Frequent Mental Distress', async ({ page }) => {
  await page.goto('/exploredata?mls=1.frequent_mental_distress-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Frequent mental distress in' })
    .click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(2).click()
  await page.locator('#menu- div').first().click()
  await page.getByText('See the states/territories').click()
  await page.getByText('Consider the possible impact').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Frequent mental distress in' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of all frequent mental' })
    .click()
  await page.getByText('No unknown values for race').click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Breakdown summary for' }).click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page
    .getByText('Frequent mental distress cases', { exact: true })
    .click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Unfortunately there are').click()
  await page.getByText('Do you have information that').click()
})
