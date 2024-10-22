import { test } from '@playwright/test'

test('Diabetes USA', async ({ page }) => {
  await page.goto('/exploredata?mls=1.diabetes-3.00&group1=All')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Diabetes in the United States' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Diabetes in the United States' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total adult diabetes cases' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for' }).click()
  await page.getByText('Share this report:').click()
  await page
    .locator('#definitionsList')
    .getByText('Diabetes', { exact: true })
    .click()
  await page.getByText('Do you have information that').click()
})

test('Diabetes County', async ({ page }) => {
  await page.goto('/exploredata?mls=1.diabetes-3.08031&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Diabetes in Denver County,' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Ages 18+' })
    .click()
  await page.getByLabel('Legend for rate map').click()
  await page.locator('li').filter({ hasText: 'Denver County' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Diabetes in Denver County,' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Ages 18+' })
    .click()
  await page.locator('#rate-chart').getByText('Sources: County Health').click()
  await page
    .getByRole('combobox', { name: 'Demographic Race/ethnicity' })
    .click()
  await page.locator('#menu- div').first().click()
  await page
    .getByRole('combobox', { name: 'Demographic Race/ethnicity' })
    .click()
  await page.getByLabel('Age unavailable at the county').click()
  await page.getByLabel('Sex unavailable at the county').click()
})
