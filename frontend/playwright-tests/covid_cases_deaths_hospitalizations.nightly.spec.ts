import { test } from '@playwright/test'

test('Covid Cases', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_cases')
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Rates of COVID-19 cases since' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .getByRole('heading', { name: 'Monthly COVID-19 cases per' })
    .click()
  await page.getByText('rates over time', { exact: true }).click()
  await page.getByLabel('Collapse data table view of').click()
})

test('Covid Deaths', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_deaths')
  await page.getByRole('button', { name: 'Deaths', exact: true }).click()
  await page.getByRole('button', { name: 'Hospitalizations' }).click()
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of COVID-19' })
    .click()
  await page.getByRole('heading', { name: 'Share of total COVID-19' }).click()
})

test('Covid Hospitalizations', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&dt1=covid_hospitalizations')
  await page
    .locator('#rate-map')
    .getByRole('heading', {
      name: 'Rates of COVID-19 hospitalizations since Jan 2020 in the United States',
    })
    .click()
  await page.getByText('Expand rates over time table').click()
})
