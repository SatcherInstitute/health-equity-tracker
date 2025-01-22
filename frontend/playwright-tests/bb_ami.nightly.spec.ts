import { test } from '@playwright/test'

test('PHRMA: Beta Blockers after Heart Attack (AMI)', async ({ page }) => {
  await page.goto('/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All')
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Race/Ethnicity' })
    .click()
  await page.getByRole('menuitem', { name: 'Eligibility' }).click()
  await page.getByText('Medicare eligibility:').click()
  await page
    .getByRole('button', { name: 'Eligible due to disability', exact: true })
    .click()
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Population Persistent to Beta' })
    .click()
  await page
    .getByRole('heading', {
      name: 'Medicare Beta-Blocker Beneficiaries, Eligible due to disability, Ages 18+',
    })
    .click()
  await page.getByLabel('Legend for rate map').getByRole('img').click()
  await page
    .locator('li')
    .filter({
      hasText:
        'Total population of Medicare Beta-Blocker Beneficiaries, Ages 18+:',
    })
    .click()
  await page
    .locator('#rate-chart')
    .getByRole('heading', { name: 'Population Persistent to Beta' })
    .click()
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  await page.getByText('No unknown values for').click()
  await page.getByRole('columnheader', { name: 'Medicare eligibility' }).click()
  await page.getByRole('columnheader', { name: '% of pop. receiving' }).click()
  await page.getByRole('button', { name: 'Definitions & missing data' }).click()
  await page.getByText('Medication Utilization in the').click()
  await page
    .getByText(
      'Population Receiving Persistent Beta Blocker Treatment After a Heart Attack',
      { exact: true },
    )
    .click()
  await page
    .getByText(
      'Measurement Definition: National Quality Forum measure representing the',
    )
    .click()
  await page
    .getByText(
      'Clinical Importance: Beta-blockers are recommended by clinical guidelines for',
    )
    .click()
  await page
    .getByRole('heading', { name: 'Medicare Administration Data' })
    .click()
  await page.getByText('What demographic data are').click()
  await page.getByText('Disability: Although').click()
})
