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
