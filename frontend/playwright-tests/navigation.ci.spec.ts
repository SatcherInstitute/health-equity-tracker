import { expect, test } from './utils/fixtures'

test('COVID Deaths: Investigate Mode to Compare Geos Mode and Back', async ({
  page,
}) => {
  // Landing Page Loads
  await page.goto('/exploredata?mls=1.covid-3.00&dt1=covid_deaths', {
    waitUntil: 'domcontentloaded',
  })

  // change to "Compare Places mode"
  await page.getByText('Off').nth(1).click()
  await page.getByRole('option', { name: 'Places' }).click()

  const madlibBox = page.locator('#madlib-container')
  await expect(madlibBox).toContainText('Compare rates of')

  // back button works properly for tracker mode changes
  await page.goBack()
  await expect(madlibBox).toContainText('Investigate')
})

test('Clicking a state on national map loads state report; back button returns to national', async ({
  page,
}) => {
  // start at HIV national
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence',
    { waitUntil: 'domcontentloaded' },
  )

  // click state of Mass. (using specific path index is brittle but necessary for SVG maps without clear roles)
  // Ensure the map is actually visible first
  const rateMap = page.locator('#rate-map')
  await expect(rateMap).toBeVisible()

  await page.locator('path:nth-child(46)').click()

  // Confirm correct madlib setting includes FIPS for state of Mass.
  await expect(page).toHaveURL(/.*mls=1.hiv-3.25/)

  // back button should take you back to National report
  await page.goBack()
  await expect(page).toHaveURL(/.*mls=1.hiv-3.00/)
})

test('Clicking a county on state map loads county report; back button returns to state', async ({
  page,
}) => {
  // start at Jail in Georgia, by race
  await page.goto(
    '/exploredata?mls=1.incarceration-3.13&mlp=disparity&dt1=jail',
    { waitUntil: 'domcontentloaded' },
  )

  // Wait for map to be ready
  const rateMap = page.locator('#rate-map')
  await expect(rateMap).toBeVisible()

  // click on specific county
  await page.locator('path:nth-child(122)').click()

  // Confirm correct madlib setting includes FIPS for county
  await expect(page).toHaveURL(/.*mls=1.incarceration-3.13177/)
})

test('Clear selections button from Compare Topics mode returns tracker to default state', async ({
  page,
}) => {
  // Use direct URL to get to the Compare report state instead of clicking through landing page
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'domcontentloaded' },
  )

  // clear topic
  await page.getByRole('button', { name: 'Poverty', exact: true }).click()
  await page.getByRole('link', { name: 'Clear selections' }).click()

  // should return to default page (with explicit params or clean base)
  await expect(page).toHaveURL('/exploredata')
})

test('Use Table of Contents to Scroll Unknown Map Into View and Be Focused', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.incarceration-3.00&mlp=disparity&dt1=hiv_prevalence',
    { waitUntil: 'domcontentloaded' },
  )

  // find Table of Contents link to Unknown Map
  await page
    .getByRole('button', { name: 'Unknown demographic map', exact: true })
    .click()

  // ensure card is on the page, focused, and visible
  const unknownMapCard = page.locator('#unknown-demographic-map')
  await expect(unknownMapCard).toBeFocused()
  await expect(unknownMapCard).toBeVisible()
})

test('Including the Extremes Mode Param in URL should load report with Extremes Mode Enabled', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.incarceration-3.00&mlp=disparity&dt1=hiv_prevalence&extremes=true',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')

  // Verify Extremes Mode UI elements are present using Parallel Soft Assertions
  await Promise.all([
    expect
      .soft(
        rateMap.getByRole('heading', { name: '(only states/territories with' }),
      )
      .toBeVisible(),
    expect
      .soft(rateMap.getByRole('heading', { name: 'Highest:' }))
      .toBeVisible(),
    expect
      .soft(rateMap.getByRole('heading', { name: 'Lowest:' }))
      .toBeVisible(),
    expect
      .soft(
        page.getByRole('button', {
          name: 'Reset to show all states/territories',
        }),
      )
      .toBeVisible(),
  ])
})

test('Extremes Mode Param in URL should work for both sides of Compare mode report', async ({
  page,
}) => {
  await page.goto(
    'exploredata?mls=1.hiv-3.00-5.13&mlp=comparegeos&dt1=hiv_prevalence&extremes2=true',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap1 = page.locator('#rate-map')
  const rateMap2 = page.locator('#rate-map2')

  await test.step('Verify Compare Mode Extremes', async () => {
    await Promise.all([
      // map 1 in normal mode (Standard Title)
      expect
        .soft(rateMap1.getByRole('heading', { name: 'Ages 13+' }))
        .toBeVisible(),
      expect
        .soft(
          rateMap1.getByRole('button', { name: 'Expand state/territory rate' }),
        )
        .toBeVisible(),

      // map 2 in extremes mode (Extremes Title)
      expect
        .soft(
          rateMap2.getByRole('heading', {
            name: 'Ages 13+ (only counties with',
          }),
        )
        .toBeVisible(),
      expect
        .soft(
          rateMap2.getByRole('button', { name: 'Reset to show all counties' }),
        )
        .toBeVisible(),
    ])
  })

  // Interaction: Reset Map 2
  await rateMap2
    .getByRole('button', { name: 'Reset to show all counties' })
    .click()

  // Verify Map 2 returns to normal
  await expect(
    rateMap2.getByRole('heading', { name: 'Ages 13+' }),
  ).toBeVisible()
})
