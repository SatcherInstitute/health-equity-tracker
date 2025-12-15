import { expect, test } from './utils/fixtures'

test('Topic Info Modal from Sidebar', async ({ page }) => {
  // 1. Navigate to the Comparison View
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'domcontentloaded' },
  )

  // 2. Open Modal via Sidebar Button
  await page.getByRole('button', { name: 'open the topic info modal' }).click()
  await expect(page).toHaveURL(/.*topic-info=true/)

  // 3. Test Navigation within Modal (Methodology Link)
  await page.getByRole('link', { name: 'methodology' }).click()
  await expect(page).toHaveURL(/.*methodology\/topic-categories\/pdoh/)

  // 4. Test Browser Back Button Behavior
  await page.goBack({ waitUntil: 'commit' })
  // Ensure we are back at the modal state
  await expect(page).toHaveURL(/.*topic-info=true/)

  // 5. Close Modal
  await page.getByRole('button', { name: 'close topic info modal' }).click()
  await expect(page).not.toHaveURL(/.*topic-info=true/)
})

test('Topic Info Modal from Map Legend', async ({ page }) => {
  await page.goto('/exploredata?mls=1.health_insurance-3.12&group1=All', {
    waitUntil: 'domcontentloaded',
  })

  // Interact with the Legend Modal
  const rateMap = page.locator('#rate-map')
  await rateMap.scrollIntoViewIfNeeded()

  await rateMap
    .getByRole('button', { name: 'Click for more info on uninsured people' })
    .click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect
    .soft(page.getByRole('heading', { name: 'Uninsured people' }))
    .toBeVisible()

  await page.getByLabel('close topic info modal').click()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('Multiple Maps 1 (Left Side)', async ({ page }) => {
  // Navigate directly to the "Open" state via URL params
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison&multiple-maps=true',
    { waitUntil: 'domcontentloaded' },
  )

  // Verify the Multimap Header
  await expect
    .soft(
      page.getByRole('heading', {
        name: 'Prison incarceration in Georgia across all race/ethnicity groups',
      }),
    )
    .toBeVisible()

  // Close and Verify URL update
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page).not.toHaveURL(/.*multiple-maps=true/)
})

test('Multiple Maps 2 (Right Side)', async ({ page }) => {
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'domcontentloaded' },
  )

  // Interaction: Open Right Side Multimap
  await page
    .locator('#rate-map2')
    .getByLabel(
      'Launch multiple maps view with side-by-side maps of each race/ethnicity group',
    )
    .click()

  // Verify URL and Content
  await expect(page).toHaveURL(/.*multiple-maps2=true/)
  await expect
    .soft(
      page.getByRole('heading', {
        name: 'People below the poverty line in Georgia across all race/ethnicity groups',
      }),
    )
    .toBeVisible()

  // Close
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page).not.toHaveURL(/.*multiple-maps2=true/)
})
