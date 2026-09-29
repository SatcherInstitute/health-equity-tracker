import { expect, test } from './utils/fixtures'

test('Cervical Cancer: state-level uses standard labels', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.cancer_incidence-3.12&dt1=cervical_cancer_incidence&demo=race_and_ethnicity&group1=All',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Map heading uses standard chart title', async () => {
    await expect
      .soft(rateMap.getByRole('heading', { name: 'Cervical cancer rates' }))
      .toBeVisible()
  })

  await test.step('Definition uses standard CDC WONDER text', async () => {
    const definitionsList = page.locator('#definitionsList')
    await definitionsList.scrollIntoViewIfNeeded()
    await expect
      .soft(definitionsList.getByText('CDC WONDER'))
      .toBeVisible()
    await expect
      .soft(definitionsList.getByText('crude rates'))
      .toBeVisible()
  })

  await page.getByRole('button', { name: 'Data table' }).click()
  await page.getByText('Summary for cervical cancer cases').scrollIntoViewIfNeeded()

  await test.step('Data table uses standard column header without age-adjusted', async () => {
    await expect
      .soft(
        page.getByRole('columnheader', {
          name: 'Cervical cancer cases per 100k',
          exact: true,
        }),
      )
      .toBeVisible()
    await expect
      .soft(
        page.getByRole('columnheader', {
          name: 'Cervical cancer cases per 100k (age-adjusted)',
        }),
      )
      .not.toBeVisible()
  })
})

// A county request that forgets the state FIPS suffix still succeeds — it just
// downloads the full national file (3.4 MB vs 83 KB), so only a request
// assertion catches the regression.
test('Cervical Cancer: county-level requests the state-split NCI file', async ({
  page,
}) => {
  const countyRequests: string[] = []
  page.on('request', (req) => {
    const url = decodeURIComponent(req.url())
    if (url.includes('nci_cancer')) countyRequests.push(url)
  })

  const firstRequest = page.waitForRequest(
    (req) => decodeURIComponent(req.url()).includes('nci_cancer'),
    { timeout: 60000 },
  )
  await page.goto(
    '/exploredata?mls=1.cancer_incidence-3.06037&dt1=cervical_cancer_incidence&demo=race_and_ethnicity&group1=All',
    { waitUntil: 'domcontentloaded' },
  )
  await firstRequest

  expect(countyRequests.length).toBeGreaterThan(0)
  for (const url of countyRequests) {
    expect(url).toMatch(/nci_cancer-\w+_county_current-06\.json/)
  }
})

test('Cervical Cancer: county-level uses age-adjusted label overrides', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.cancer_incidence-3.06037&dt1=cervical_cancer_incidence&demo=race_and_ethnicity&group1=All',
    { waitUntil: 'domcontentloaded' },
  )

  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await test.step('Map heading uses age-adjusted chart title override', async () => {
    await expect
      .soft(
        rateMap.getByRole('heading', {
          name: 'Age-adjusted cervical cancer rates',
        }),
      )
      .toBeVisible()
  })

  await test.step('Definition uses NCI county override text', async () => {
    const definitionsList = page.locator('#definitionsList')
    await definitionsList.scrollIntoViewIfNeeded()
    await expect
      .soft(definitionsList.getByText('NCI State Cancer Profiles'))
      .toBeVisible()
    await expect
      .soft(definitionsList.getByText('age-adjusted rates'))
      .toBeVisible()
  })

  await page.getByRole('button', { name: 'Data table' }).click()
  await page.getByText('Summary for cervical cancer cases').scrollIntoViewIfNeeded()

  await test.step('Data table uses age-adjusted column header override', async () => {
    await expect
      .soft(
        page.getByRole('columnheader', {
          name: 'Cervical cancer cases per 100k (age-adjusted)',
        }),
      )
      .toBeVisible()
  })
})
