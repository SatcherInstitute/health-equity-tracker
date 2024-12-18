import { test } from '@playwright/test'

test('HIV: Prevalance', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_prevalence')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'HIV prevalence in the United' })
    .click()
  await page
    .getByRole('heading', { name: 'HIV prevalence over time in' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'HIV prevalence in the United' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total HIV prevalence' })
    .click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for HIV' }).click()
  await page.getByText('Share this report:').click()
  await page.getByText('HIV prevalence', { exact: true }).click()
  await page.getByRole('heading', { name: 'What data are missing?' }).click()
  await page.getByRole('button', { name: 'Prevalence', exact: true }).click()
  await page.getByRole('menuitem', { name: 'New diagnoses' }).click()
})

test('HIV: Diagnoses', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_diagnoses')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'HIV diagnoses in the United' })
    .click()
  await page
    .getByRole('heading', { name: 'HIV diagnoses over time in' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'HIV diagnoses in the United' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total HIV diagnoses' })
    .click()
  await page
    .getByRole('heading', { name: 'Historical relative inequity' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for HIV' }).click()
  await page.getByText('Share this report:').click()
  await page.getByText('New HIV diagnoses', { exact: true }).click()
  await page.getByText('Do you have information that').click()
  await page.getByRole('button', { name: 'New diagnoses' }).click()
  await page.getByRole('menuitem', { name: 'Deaths' }).click()
})

test('HIV: Deaths', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_deaths')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'HIV deaths in the United' })
    .click()
  await page
    .getByRole('heading', { name: 'Rates of HIV deaths over time' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'HIV deaths in the United' })
    .click()
  await page.getByRole('heading', { name: 'Share of total HIV deaths' }).click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for HIV' }).click()
  await page.getByRole('heading', { name: 'Age-adjusted HIV deaths' }).click()
  await page.getByText('Share this report:').click()
  await page.getByText('HIV deaths', { exact: true }).click()
})
