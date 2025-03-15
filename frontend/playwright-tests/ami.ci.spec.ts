import { test } from '@playwright/test'

test('PHRMA: Medicare AMI', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.12&group1=85PLUS&dt1=medicare_ami&demo=age',
  )
  await page
    .getByRole('heading', { name: 'Investigate rates of Medicare' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Rates of Acute MI in Florida' })
    .click()
  await page
    .getByRole('heading', {
      name: 'Medicare Beneficiaries diagnosed with AMI, Ages 85+',
    })
    .click()
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Total population of Medicare' })
    .click()
  await page
    .getByText(
      'Acute Myocardial Infarctions (Heart Attacks): The number of Medicare fee-for-',
    )
    .click()
  await page.getByRole('button', { name: 'Rate chart' }).click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Rates of Acute MI in Florida' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Medicare Beneficiaries' })
    .click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page.getByRole('heading', { name: 'Share of beneficiary' }).click()
  await page
    .locator('#population-vs-distribution')
    .getByRole('heading', { name: 'Medicare Beneficiaries' })
    .click()
  await page
    .getByRole('img', { name: 'light green bars represent %' })
    .locator('circle')
    .click()
  await page
    .getByRole('img', { name: 'dark green bars represent %' })
    .locator('circle')
    .click()
  await page.getByLabel('Comparison bar chart showing').getByText('age').click()
  await page.getByText('% of beneficiary pop. vs % of').click()
  await page.getByRole('button', { name: 'Data table' }).click()
  await page
    .getByRole('heading', { name: 'Summary for acute myocardial' })
    .click()
  await page
    .getByRole('figure', { name: 'Summary for acute myocardial' })
    .locator('h4')
    .click()
  await page.getByRole('columnheader', { name: 'Age' }).click()
  await page
    .getByRole('columnheader', { name: 'Medicare beneficiary acute MI' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Share of total beneficiary' })
    .click()
  await page
    .getByRole('columnheader', { name: 'Share of all beneficiaries' })
    .click()
})
