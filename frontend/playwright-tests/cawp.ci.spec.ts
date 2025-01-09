import { test } from '@playwright/test'

test.setTimeout(120000)

test('CAWP: Congress', async ({ page }) => {
  await page.goto('/exploredata?mls=1.women_in_gov-3.00&group1=All')

  await page
    .getByRole('button', { name: 'Expand state/territory rate' })
    .click()

  await page.getByText('U.S. Virgin Islands,').click()
  await page.getByText('Puerto Rico,').click()
  await page.getByText('American Samoa,').click()
  await page.getByText('District of Columbia', { exact: true }).click()
  await page.getByLabel('Include All women').click()
  await page.getByText('Expand rates over time table').click()
  await page.getByRole('cell', { name: '1951' }).click()
  await page.getByRole('cell', { name: '1952' }).click()

  await page.waitForSelector(
    'div[role="note"] >> text=No unknown values for race',
    { timeout: 120000 },
  )
  await page
    .getByText(
      'No unknown values for race and ethnicity reported in this dataset at the state/territory level.',
    )
    .click()
  await page
    .locator('#inequities-over-time')
    .getByLabel('Include Black or African American women')
    .click()
  await page.getByText('Expand inequities over time table').click()
  await page
    .getByRole('columnheader', {
      name: 'Black or African American women % relative inequity',
    })
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total women in US congress in the United States',
    )
    .getByRole('img')
    .click()
  await page
    .getByLabel(
      'Comparison bar chart showing Population vs. distribution of total women in US congress in the United States',
    )
    .getByText('7.1% of women members', { exact: true })
    .click()

  await page.getByRole('button', { name: 'US Congress', exact: true }).click()
  await page.getByRole('menuitem', { name: 'State legislatures' }).click()
  await page
    .getByRole('button', { name: 'Population vs. distribution' })
    .click()

  await page.waitForSelector(
    'text=Percentages reported for Women in state legislatures cannot be summed, as these',
    { timeout: 60000 },
  )
  await page
    .getByText(
      'Percentages reported for Women in state legislatures cannot be summed, as these ',
    )
    .click()
})

test('CAWP: State Legislature', async ({ page }) => {
  await page.goto('/exploredata?mls=1.women_in_gov-3.00&group1=All')
  await page.getByRole('button', { name: 'US Congress', exact: true }).click()
  await page.getByRole('menuitem', { name: 'State legislatures' }).click()
  await page.getByLabel('Race and Ethnicity:').click()
  await page.getByRole('button', { name: 'Black or African American' }).click()

  await page.waitForSelector('#rate-map h3:has-text("Percentage of state")', {
    timeout: 60000,
  })
  await page
    .locator('#rate-map')
    .getByRole('heading', { name: 'Percentage of state' })
    .click()
  await page.getByRole('heading', { name: 'Black or African American' }).click()
  await page.getByLabel('Click for more info on Women').click()
  await page
    .getByRole('heading', { name: 'Women in state legislatures' })
    .click()
})
