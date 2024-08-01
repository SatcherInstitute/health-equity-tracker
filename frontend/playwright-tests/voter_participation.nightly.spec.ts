import { test, expect } from '@playwright/test'

test('Voter Participation Flow', async ({ page }) => {
  await page.goto('/exploredata?mls=1.voter_participation-3.00&group1=All')
  await page.getByText('“The vote is precious. It is').click()
  await page
    .getByRole('button', { name: 'Check your voter registration' })
    .click()
  await page
    .frameLocator('iframe[title="Vote\\.org Registration Checker"]')
    .getByRole('heading', { name: 'Are You Registered to Vote?' })
    .click()
  await page.getByLabel('close modal').click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Voter participation in the' })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'U.S. citizens, Ages 18+' })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'U.S. citizens, Ages 18+' })
    .click()
  await page.getByLabel('Bar Chart showing Voter').getByRole('img').click()
  await page.getByRole('heading', { name: 'Share of all voter' }).click()
  await page.getByText('No unknown values for race').click()
  await page
    .getByRole('heading', { name: 'Graph unavailable: Population' })
    .click()
  await page
    .getByRole('heading', { name: 'Breakdown summary for voter' })
    .click()
  await page
    .getByRole('figure', { name: 'Breakdown summary for voter' })
    .locator('h4')
    .click()
  await page.getByRole('columnheader', { name: 'Race and Ethnicity' }).click()
  await page.getByRole('cell', { name: 'Asian (NH)' }).click()
  await page
    .getByRole('cell', { name: 'Black or African American (NH)' })
    .click()
})
