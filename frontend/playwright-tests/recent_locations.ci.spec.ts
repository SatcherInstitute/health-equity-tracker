import { expect, test } from '@playwright/test'

test('Recent Locations Feature', async ({ page }) => {
  await page.goto('http://localhost:3000/exploredata?mls=1.hiv-3.23&group1=All')
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Maine' })
    .click()
  await page.getByRole('combobox').click()
  await page.getByRole('combobox').fill('florida')
  await page.getByRole('combobox').press('Enter')
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Florida' })
    .click()
  await page.getByRole('combobox').click()
  await page.getByRole('combobox').fill('california')
  await page.getByRole('combobox').press('Enter')
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'California' })
    .click()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Florida', exact: true }).click()
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Florida' })
    .click()
  await page.getByRole('combobox').click()
  await page.getByRole('button', { name: 'Clear' }).click()
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Florida' })
    .click()
  await page.getByRole('combobox').click()

  await page.getByText('National').click()
  await page.getByText('States', { exact: true }).click()
  // assert that Recent Locations is NOT in the list
  await expect(page.getByText('Recent Locations')).not.toBeVisible()
})
