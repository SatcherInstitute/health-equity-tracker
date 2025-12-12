import { expect, test } from './utils/fixtures'

test('Prison by Race', async ({ page }) => {
  await page.goto('/exploredata?mls=1.incarceration-3.00&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    await Promise.all([
      expect
        .soft(
          rateMap.getByRole('heading', { name: 'Prison incarceration in the' }),
        )
        .toBeVisible(),
      // using .first() handles potential duplicates in the list
      expect
        .soft(page.locator('li').filter({ hasText: 'United States' }).first())
        .toBeVisible(),
    ])
  })

  // --- Interaction: Info Modal ---
  // Ensure the modal actually works
  await page.getByLabel('Click for more info on people').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('close topic info modal').click()
  await expect(page.getByRole('dialog')).toBeHidden()

  // --- Missing Data Section ---
  await test.step('Verify Missing Data Info', async () => {
    await Promise.all([
      expect
        .soft(
          page.getByRole('heading', { name: 'Graph unavailable: Rates of' }),
        )
        .toBeVisible(),
      expect.soft(page.getByText('Our data sources do not have')).toBeVisible(),
    ])
  })

  // --- Rate Chart Section ---
  const rateChart = page.locator('#rate-chart')
  await rateChart.scrollIntoViewIfNeeded()

  await test.step('Verify Rate Chart', async () => {
    await Promise.all([
      expect
        .soft(
          rateChart.getByRole('heading', {
            name: 'Prison incarceration in the',
          }),
        )
        .toBeVisible(),
      // 'children' is in the definitions footer, use .first() to avoid strict mode errors
      expect
        .soft(rateChart.getByText('children').first())
        .toBeVisible(),
    ])
  })

  // --- Unknown Demographic Map ---
  await page.getByRole('button', { name: 'Unknown demographic map' }).click()
  const unknownMap = page.locator('#unknown-demographic-map')
  await unknownMap.scrollIntoViewIfNeeded()

  await test.step('Verify Unknown Map', async () => {
    await expect
      .soft(unknownMap.getByText('0.4% of prison pop. reported'))
      .toBeVisible()
  })
})

test('Jail by Age', async ({ page }) => {
  await page.goto('/exploredata?mls=1.incarceration-3.00&group1=All&dt1=jail', {
    waitUntil: 'domcontentloaded',
  })

  // --- Interaction: Filter by Age ---
  // 1. Open the Category Dropdown
  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Race/Ethnicity' })
    .click()

  // 2. Select Age
  await page.getByRole('menuitem', { name: 'Age' }).click()

  // 3. Open the Age specific Dropdown
  // (We wait for the label to be visible to ensure stability)
  await expect(page.getByText('Age:')).toBeVisible()
  await page.getByText('Age:').click()

  // 4. Select '18+'
  await page.getByRole('button', { name: '18+' }).click()

  // --- Map Section ---
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Verify Map Section', async () => {
    // Now that 18+ is selected, this header should appear
    await expect
      .soft(rateMap.getByRole('heading', { name: 'Ages 18+' }))
      .toBeVisible()
  })

  // --- Data Table Section ---
  await page.getByRole('button', { name: 'Data table' }).click()
  await page.getByRole('columnheader', { name: 'Age' }).scrollIntoViewIfNeeded()

  await test.step('Verify Data Table', async () => {
    await Promise.all([
      expect
        .soft(page.getByRole('columnheader', { name: 'Age' }))
        .toBeVisible(),
      expect
        .soft(
          page.getByRole('columnheader', { name: 'People in jail per 100k' }),
        )
        .toBeVisible(),
    ])
  })
})
