import { test } from '@playwright/test'

test('PHRMA: Medicare AMI', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.12&group1=85PLUS&dt1=medicare_ami&demo=age',
  )
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Rates of Acute MI in Florida' })
    .click()
  await page
    .getByRole('heading', {
      name: 'Medicare Beneficiaries diagnosed with AMI, Ages 85+',
    })
    .click()
  await page.getByLabel('Legend for rate map').getByRole('img').click()
  await page
    .locator('li')
    .filter({
      hasText:
        'Total population of Medicare Beneficiaries diagnosed with AMI, Ages 18+:',
    })
    .click()
  await page
    .locator('#rate-chart')
    .getByText('Medicare Administrative Data (data from 2020) ')
    .click()
  await page.locator('#unknown-demographic-map').getByRole('note').click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()
  await page
    .getByLabel('Comparison bar chart showing')
    .getByRole('img')
    .nth(1)
    .click()
  await page.getByRole('heading', { name: 'Summary for acute' }).click()
  await page.getByText('Gender: The Medicare source').click()
  await page.getByText('Sexual Orientation:').click()
  await page.getByText('Sexual Orientation: The').click()
  await page.getByText('Disability:').click()
  await page.getByText('Disability: Although').click()
  await page.getByText('Social and Political').click()
})
