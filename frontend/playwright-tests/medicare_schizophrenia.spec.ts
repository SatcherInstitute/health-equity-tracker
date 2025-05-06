import { test } from '@playwright/test'

test('PHRMA MENTAL HEALTH conditions and medication adherence', async ({
  page,
}) => {
  await page.goto('/exploredata?mls=1.medicare_mental_health-3.00&group1=All')
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Population adherent to' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Medicare beneficiaries with' })
    .click()
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Total population of Medicare' })
    .click()
  await page
    .getByText(
      'Adherence to anti-psychotics: Percentage of individuals at least 18 years of',
    )
    .click()
  await page.getByRole('button', { name: 'Rate chart' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Population adherent to' })
    .click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page.getByRole('heading', { name: 'Adherent beneficiary' }).click()
  await page
    .locator('#unknown-demographic-map')
    .getByRole('heading', { name: 'Medicare beneficiaries with' })
    .click()
  await page.getByText('% unknown').click()
})
