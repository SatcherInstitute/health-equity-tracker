import { test } from '@playwright/test'

test('Covid Cases, Deaths, Hospitalizations', async ({ page }) => {
  await page.goto('/exploredata?mls=1.covid-3.00&group1=All')
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
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of COVID-19 cases since' })
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
  await page
    .getByRole('heading', { name: 'Breakdown summary for COVID-' })
    .click()
  await page.getByText('Share this report:').click()
  await page.getByText('COVID-19 cases', { exact: true }).click()
  await page.getByText('Do you have information that').click()
  await page.goto(
    'http://localhost:3000/exploredata?mls=1.covid-3.00&group1=All'
  )
  await page.getByRole('button', { name: 'Cases', exact: true }).click()
  await page.getByRole('button', { name: 'Deaths' }).click()
  await page.getByText('Race and Ethnicity:').click()
  await page.locator('.MuiBackdrop-root').click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Rates of COVID-19 deaths' })
    .click()
  await page.getByText('Demographic', { exact: true }).nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .getByRole('heading', { name: 'Monthly COVID-19 deaths per' })
    .click()
  await page.getByText('rates over time', { exact: true }).click()
  await page.getByLabel('Collapse data table view of').click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of COVID-19 deaths' })
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
  await page
    .getByRole('heading', { name: 'Breakdown summary for COVID-' })
    .click()
  await page
    .getByRole('heading', { name: 'Age-adjusted COVID-19 deaths' })
    .click()
  await page.getByText('Share this report:').click()
  await page.getByText('COVID-19 deaths', { exact: true }).click()
  await page.getByText('Do you have information that').click()
  await page.goto(
    'http://localhost:3000/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_deaths'
  )
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
  await page
    .getByRole('button', { name: 'Inequities over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Relative inequity for COVID-' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page
    .getByRole('heading', { name: 'Breakdown summary for COVID-' })
    .click()
  await page.getByRole('heading', { name: 'Age-adjusted COVID-19' }).click()
})
