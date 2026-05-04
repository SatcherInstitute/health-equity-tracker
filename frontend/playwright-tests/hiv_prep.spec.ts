import { test } from '@playwright/test'

test('HIV PrEP: Rate Map', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_prep-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'PrEP coverage in the United' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Ages 16+' })
    .click()
})

test('HIV PrEP: Rates Over Time', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_prep-3.00&group1=All&demo=sex')
  await page
    .getByRole('button', { name: 'Rates over time', exact: true })
    .click()
  await page
    .getByRole('heading', { name: 'Rates of PrEP coverage over' })
    .click()
  await page.getByLabel('Include All').click()
  await page.getByLabel('Include Female').click()
  await page.getByLabel('Include Male').click()
  await page.getByText('% PrEP coverage →').click()
  await page
    .getByRole('button', { name: 'Expand rates over time table' })
    .click()
  await page.getByRole('columnheader', { name: 'All % PrEP coverage' }).click()
  await page
    .getByRole('columnheader', { name: 'Female % PrEP coverage' })
    .click()
  await page
    .getByText('Rates of PrEP coverage over time in the United States by sex')
    .click()
})

test('HIV PrEP: Rate chart', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_prep-3.00&group1=All&demo=sex')
  await page.getByRole('button', { name: 'Rate chart', exact: true }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'PrEP coverage in the United' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Ages 16+' })
    .click()
  await page.getByRole('heading', { name: 'Share of total PrEP' }).click()
})
