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
  await page.goBack({ waitUntil: 'commit' })
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
  await page.goBack({ waitUntil: 'commit' })
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

  // Wait for map SVG paths to be rendered before clicking
  const rateMap = page.locator('#rate-map')
  await expect(rateMap).toBeVisible()
  await expect(rateMap.locator('svg path').first()).toBeVisible()

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

test('Including the Extremes Mode Param in URL should load report with Extremes Mode Enabled', async ({
  page,
}) => {
  // Previously used mls=1.incarceration with dt1=hiv_prevalence — mismatched
  // topic/data-type so no data loaded and extremes UI never rendered. Fixed to
  // use a consistent HIV topic + HIV data type at national level.
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence&extremes=true',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await expect(rateMap).toBeVisible()

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
  // Previously missing the leading "/" so Playwright resolved the URL
  // relative to the current path instead of the base URL root.
  await page.goto(
    '/exploredata?mls=1.hiv-3.00-5.13&mlp=comparegeos&dt1=hiv_prevalence&extremes2=true',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap1 = page.locator('#rate-map')
  const rateMap2 = page.locator('#rate-map2')
  await expect(rateMap1).toBeVisible()
  await expect(rateMap2).toBeVisible()

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

test('Selecting a demographic writes the demo param to the URL', async ({
  page,
}) => {
  // HIV national defaults to Race/Ethnicity; Age is also available
  await page.goto('/exploredata?mls=1.hiv-3.00&dt1=hiv_prevalence', {
    waitUntil: 'domcontentloaded',
  })

  // DemographicSelector is a popover: first click opens it, then pick the option
  await page.getByRole('button', { name: 'Race/Ethnicity' }).first().click()
  await page.getByRole('menuitem', { name: 'Age' }).click()

  // useParamState should write demo=age into the URL
  await expect(page).toHaveURL(/demo=age/)
})

test('Data sub-type change produces one history entry; back returns to previous sub-type', async ({
  page,
}) => {
  // Start with HIV Prevalence
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/dt1=hiv_prevalence/)

  // Switch to New diagnoses via the DataTypeSelector popover
  await page.getByRole('button', { name: 'Prevalence' }).click()
  await page.getByRole('menuitem', { name: 'New diagnoses' }).click()
  await expect(page).toHaveURL(/dt1=hiv_diagnoses/)

  // One back-press must return to hiv_prevalence — not stay on hiv_diagnoses.
  // A double-pushState bug would leave the back button stuck on the same state.
  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/dt1=hiv_prevalence/)
  await expect(page).not.toHaveURL(/dt1=hiv_diagnoses/)
})

test('Sequential topic and geo changes each produce one history entry', async ({
  page,
}) => {
  // State 1: HIV national
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence',
    { waitUntil: 'domcontentloaded' },
  )

  // State 2: switch sub-type to Deaths
  await page.getByRole('button', { name: 'Prevalence' }).click()
  await page.getByRole('menuitem', { name: 'Deaths' }).click()
  await expect(page).toHaveURL(/dt1=hiv_deaths/)

  // State 3: switch sub-type to New diagnoses (exact: true avoids matching
  // the "Click for more info on HIV deaths" info button also on the page)
  await page.getByRole('button', { name: 'Deaths', exact: true }).click()
  await page.getByRole('menuitem', { name: 'New diagnoses' }).click()
  await expect(page).toHaveURL(/dt1=hiv_diagnoses/)

  // Back from state 3 → state 2 (hiv_deaths)
  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/dt1=hiv_deaths/)

  // Back from state 2 → state 1 (hiv_prevalence)
  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/dt1=hiv_prevalence/)
})

test('Cross-topic navigation: back button traverses all steps including topic switch', async ({
  page,
}) => {
  // State 1: HIV national, Prevalence
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/dt1=hiv_prevalence/)

  // State 2: HIV New diagnoses
  await page.getByRole('button', { name: 'Prevalence' }).click()
  await page.getByRole('menuitem', { name: 'New diagnoses' }).click()
  await expect(page).toHaveURL(/dt1=hiv_diagnoses/)

  // State 3: HIV Deaths (exact: true avoids "info on HIV deaths" button)
  await page.getByRole('button', { name: 'New diagnoses', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Deaths' }).click()
  await expect(page).toHaveURL(/dt1=hiv_deaths/)

  // State 4: Switch parent topic to HIV (Black Women).
  // After the topic switch the stale hiv_deaths dt is cleared from the URL
  // (Fix A) and the DataTypeSelector resets to the first BW option so the
  // button is no longer empty.
  await page.getByRole('button', { name: 'HIV', exact: true }).click()
  await page.getByRole('menuitem', { name: 'HIV (Black Women)' }).click()
  await expect(page).toHaveURL(/mls=1.hiv_black_women/)
  await expect(page).not.toHaveURL(/dt1=hiv_deaths/)

  // State 5: BW New Diagnoses — button now shows first BW option label
  await page
    .getByRole('button', { name: 'Prevalence for Black Women', exact: true })
    .click()
  await page.getByRole('menuitem', { name: 'New Diagnoses for Black Women' }).click()
  await expect(page).toHaveURL(/dt1=hiv_diagnoses_black_women/)

  // State 6: BW Deaths
  await page
    .getByRole('button', { name: 'New Diagnoses for Black Women', exact: true })
    .click()
  await page.getByRole('menuitem', { name: 'Deaths for Black women' }).click()
  await expect(page).toHaveURL(/dt1=hiv_deaths_black_women/)

  // Walk all 5 back steps — each must reach a distinct meaningful state.
  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/dt1=hiv_diagnoses_black_women/)

  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/mls=1.hiv_black_women/)
  await expect(page).not.toHaveURL(/dt1=/)

  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/dt1=hiv_deaths/)
  await expect(page).toHaveURL(/mls=1.hiv-/)

  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/dt1=hiv_diagnoses/)

  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/dt1=hiv_prevalence/)
})

test('Default reset from Compare Topics mode creates one history entry; back returns to compare state', async ({
  page,
}) => {
  // Start in Compare Topics mode
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/mlp=comparevars/)

  // Trigger the DEFAULT reset via "Clear selections"
  await page.getByRole('button', { name: 'Poverty', exact: true }).click()
  await page.getByRole('link', { name: 'Clear selections' }).click()
  await expect(page).toHaveURL('/exploredata')

  // One back-press should return to the comparevars report, not stay on /exploredata.
  // A double-pushState bug would leave the previous comparevars state unreachable.
  await page.goBack({ waitUntil: 'commit' })
  await expect(page).toHaveURL(/mlp=comparevars/)
})

test('demo param survives geo change via map click', async ({ page }) => {
  // Start with HIV national with Age demographic
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence&demo=age',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/demo=age/)

  // Wait for map then click Massachusetts (path:nth-child(46), FIPS 25)
  const rateMap = page.locator('#rate-map')
  await expect(rateMap).toBeVisible()
  await page.locator('path:nth-child(46)').click()
  await expect(page).toHaveURL(/mls=1.hiv-3.25/)

  // demo=age must survive the geo change — regression: new system was wiping it
  await expect(page).toHaveURL(/demo=age/)
})

test('demo param survives sub-type change', async ({ page }) => {
  // Start with HIV Prevalence at national level with Age demographic
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence&demo=age',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/demo=age/)

  // Switch sub-type to New diagnoses
  await page.getByRole('button', { name: 'Prevalence' }).click()
  await page.getByRole('menuitem', { name: 'New diagnoses' }).click()
  await expect(page).toHaveURL(/dt1=hiv_diagnoses/)

  // demo=age must survive the sub-type change
  await expect(page).toHaveURL(/demo=age/)
})

test('dt1 and demo survive mode change', async ({ page }) => {
  // Start with HIV Deaths in disparity mode with Age demographic
  await page.goto(
    '/exploredata?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_deaths&demo=age',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/dt1=hiv_deaths/)
  await expect(page).toHaveURL(/demo=age/)

  // Switch to Compare Places mode via the mode selector
  await page.getByText('Off').nth(1).click()
  await page.getByRole('option', { name: 'Places' }).click()

  // dt1 and demo must both survive the mode change
  await expect(page).toHaveURL(/dt1=hiv_deaths/)
  await expect(page).toHaveURL(/demo=age/)
  await expect(page).toHaveURL(/mlp=comparegeos/)
})

test('comparevars without dt2 in URL shows report, not blank', async ({
  page,
}) => {
  // dt2 is absent — CompareReport must fall back to METRIC_CONFIG default, not blank
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'domcontentloaded' },
  )

  // Both map cards must render — the regression caused CompareReport to return </>
  await expect(page.locator('#rate-map')).toBeVisible()
  await expect(page.locator('#rate-map2')).toBeVisible()
})

test('navigating to a topic writes dt1 explicitly to the URL', async ({
  page,
}) => {
  // Start at the HIV default state (no dt1 in URL — first entry to the topic)
  await page.goto('/exploredata?mls=1.hiv-3.00&mlp=disparity', {
    waitUntil: 'domcontentloaded',
  })

  // Open the DataTypeSelector and pick a sub-type to trigger setMadLibWithParam
  await page.getByRole('button', { name: 'Prevalence' }).click()
  await page.getByRole('menuitem', { name: 'New diagnoses' }).click()
  await expect(page).toHaveURL(/dt1=hiv_diagnoses/)

  // Back must return to the previous state which now has dt1 written explicitly
  await page.goBack({ waitUntil: 'commit' })
  // dt1 should now be present (written by setMadLibWithParam on first interaction)
  await expect(page).toHaveURL(/dt1=/)
})

