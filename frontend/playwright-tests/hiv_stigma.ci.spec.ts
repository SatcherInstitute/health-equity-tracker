import { test } from '@playwright/test'

test('HIV Stigma', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_stigma-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'HIV stigma in the United' })
    .click()
  await page.getByLabel('open the topic info modal').click()
  await page.getByLabel('close topic info modal').click()
  await page.getByText('Demographic').nth(2).click()
  await page.getByText('Off').nth(1).click()
  await page.locator('#menu- div').first().click()
  await page
    .getByRole('heading', { name: 'Rates of HIV stigma over time' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'HIV stigma in the United' })
    .click()
  await page
    .getByRole('heading', { name: 'Stigma scores with unknown' })
    .click()
  await page
    .getByRole('heading', { name: 'Graph unavailable: Population' })
    .click()
})
