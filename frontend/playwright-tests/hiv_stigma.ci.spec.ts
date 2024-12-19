import { test } from '@playwright/test'

test('HIV Stigma', async ({ page }) => {
  await page.goto('/exploredata?mls=1.hiv_stigma-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'HIV stigma in the United' })
    .click()
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
