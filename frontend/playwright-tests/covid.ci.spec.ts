import { test } from '@playwright/test'

test('Covid Cases', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_cases')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Rates of COVID-19 cases' })
    .click()
  await page
    .getByRole('heading', { name: 'Monthly COVID-19 cases per' })
    .click()
  await page.getByRole('button', { name: 'Expand rates over time' }).click()
  await page.getByRole('button', { name: 'Collapse rates over time' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of COVID-19 cases' })
    .click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total COVID-19 cases' })
    .click()
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Relative inequity for COVID-' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for COVID-' }).click()
  await page.getByText('Share this report:').click()
  await page.getByText('COVID-19 cases', { exact: true }).click()
  await page.getByText('Do you have information that').click()
})

test('Covid Deaths', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_deaths')
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of COVID-19' })
    .click()
  await page.getByRole('heading', { name: 'Share of total COVID-19' }).click()
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Relative inequity for COVID-' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for COVID-' }).click()
  await page
    .getByRole('heading', { name: 'Age-adjusted COVID-19 deaths' })
    .click()
})

test('Covid Hospitalizations', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&dt1=covid_hospitalizations')
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of COVID-19' })
    .click()
  await page.getByRole('heading', { name: 'Share of total COVID-19' }).click()
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
})
