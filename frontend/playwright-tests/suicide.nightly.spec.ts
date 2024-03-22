import { test } from '@playwright/test'

test('Suicide Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.suicide-3.00&group1=All')
  await page.getByText('Suicide & Crisis Lifeline').click()
  await page.getByText('For 24/7, free and').click()
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Suicides in the United States' })
    .click()
  await page.getByText('Demographic', { exact: true }).nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page.getByRole('button', { name: 'Expand state/territory rate' }).click();
  await page.getByText('Consider the possible impact').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Suicides in the United States' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total suicides with' })
    .click()
  await page.getByText('No unknown values for race').click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Breakdown summary for' }).click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Behavioral Health').click()
  await page.locator('#definitionsList').getByText('Suicides').click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByText('Unfortunately there are').click()
  await page.getByRole('heading', { name: 'Missing and misidentified' }).click()
  await page.getByRole('heading', { name: "Missing America's Health" }).click()
  await page.getByText('Do you have information that').click()
})
