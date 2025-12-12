import { test } from '@playwright/test'

test('COPD Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.copd-3.00&group1=All')
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'COPD in the United States' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'COPD in the United States' })
    .click()
  await page
    .getByRole('heading', { name: 'Share of total adult COPD cases' })
    .click()
  await page
    .getByRole('heading', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Summary for COPD in' }).click()
  await page.getByText('Share this report:').click()

  await page.getByRole('button', { name: 'Definitions & missing data' }).click()
  await page.getByRole('heading', { name: 'Definitions:' }).click()
  await page.getByText('Chronic Disease').click()
  await page
    .locator('#definitionsList')
    .getByText('COPD', { exact: true })
    .click()
  await page
    .getByText(
      'Measurement Definition: Adults who reported being told by a health professional',
    )
    .click()
  await page.getByText('Clinical Importance: COPD is').click()

  await page.getByText('Do you have information that').click()
})
