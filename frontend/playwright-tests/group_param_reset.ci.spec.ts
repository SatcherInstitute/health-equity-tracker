import { expect, test } from './utils/fixtures'

const AMI_URL =
  '/exploredata?mls=1.medicare_cardiovascular-3.12&group1=85PLUS&dt1=medicare_ami&demo=age'

test('group1 kept from URL on initial load (dev StrictMode)', async ({
  page,
}) => {
  await page.goto(AMI_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).toBeVisible()
  await expect(page).toHaveURL(/group1=85PLUS/)
})

test('group1 cleared when demographic type changes', async ({ page }) => {
  await page.goto(AMI_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).toBeVisible()

  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Age', exact: true })
    .click()
  await page.getByRole('menuitem', { name: 'Race/Ethnicity' }).click()

  await expect(page).not.toHaveURL(/group1=/)
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).not.toBeVisible()
})

test('group1 cleared when data type changes', async ({ page }) => {
  await page.goto(AMI_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).toBeVisible()

  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Cases of Heart Attacks (Acute MI)' })
    .click()
  await page
    .getByRole('menuitem', { name: 'Adherence to Beta Blockers' })
    .click()

  await expect(page).not.toHaveURL(/group1=/)
  await expect(page).toHaveURL(/dt1=beta_blockers_adherence/)
})

test('group selection stays in sync across back/forward', async ({ page }) => {
  await page.goto(AMI_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).toBeVisible()

  await page.getByText('Age:').first().click()
  await page.getByRole('button', { name: '75-79' }).click()
  await expect(page).toHaveURL(/group1=75-79/)
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 75-79'),
  ).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/group1=85PLUS/)
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).toBeVisible()
})

test('group2 cleared when data type changes in comparegeos mode', async ({
  page,
}) => {
  // Both comparegeos panels share dt1, so a dt1 change must clear group2 too.
  await page.goto(
    '/exploredata?mls=1.medicare_cardiovascular-3.12-5.13&mlp=comparegeos&group2=85PLUS&dt1=medicare_ami&demo=age',
    { waitUntil: 'domcontentloaded' },
  )
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).toBeVisible()

  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Cases of Heart Attacks (Acute MI)' })
    .click()
  await page
    .getByRole('menuitem', { name: 'Adherence to Beta Blockers' })
    .click()

  await expect(page).not.toHaveURL(/group2=/)
  await expect(page).toHaveURL(/dt1=beta_blockers_adherence/)
})

test('group1 cleared when topic changes', async ({ page }) => {
  await page.goto(AMI_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByText('Medicare Beneficiaries diagnosed with AMI, Ages 85+'),
  ).toBeVisible()

  await page
    .locator('#madlib-box')
    .getByRole('button', { name: 'Medicare Beneficiary' })
    .click()
  await page.getByRole('menuitem', { name: 'Asthma' }).click()

  await expect(page).not.toHaveURL(/group1=/)
  await expect(page).toHaveURL(/mls=1\.asthma/)
})
