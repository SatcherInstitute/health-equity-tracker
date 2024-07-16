import { test, expect } from '@playwright/test'

test.setTimeout(120000);

test('Topic Info Modal from Sidebar', async ({ page }) => {
  // Compare Topics Page Loads
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'commit' }
  )

  // Clicking topic info modal button launched modal
  await page.getByRole('button', { name: 'open the topic info modal' }).click()
  await expect(page).toHaveURL(/.*topic-info=true/)

  // clicking methodology link takes directly to PDOH subpage in Methodology Hub
  await page.getByRole('link', { name: 'methodology' }).click()
  await expect(page).toHaveURL(/.*methodology\/topic-categories\/pdoh/)

  // browser back button takes you back to the open topic modal
  page.goBack()

  // CLOSE modal
  await page.getByRole('button', { name: 'close topic info modal' }).click()
  await expect(page).not.toHaveURL(/.*topic-info=true/)
})

test.describe('Topic Info Modal from Map Legend', () => {
  test('Topic Info Modal from Map Legend', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });    
    await page.locator('#landingPageCTA').click();
    const reportSection = await page.getByRole('heading', { name: 'Uninsurance in FL' }).locator('..');
    await reportSection.locator('text=Explore this report').click();
    await page.locator('#rate-map').getByRole('button', { name: 'Click for more info on uninsured people' }).click();
  });
});

test('Multiple Maps 1 (Left Side)', async ({ page }) => {
  // Compare Topics Page With Multimap Open Loads
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison&multiple-maps=true',
    { waitUntil: 'commit' }
  )
  await expect(
    page.getByRole('heading', {
      name: 'Prison incarceration in Georgia across all race and ethnicity groups',
    })
  ).toBeVisible()

  // CLOSE IT
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page).not.toHaveURL(/.*multiple-maps=true/)
})

test('Multiple Maps 2 (Right Side)', async ({ page }) => {
  // Compare Topics Page Loads
  await page.goto(
    '/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'commit' }
  )

  // Clicking right side multiple maps button launches POVERTY multimap modal
  await page
    .locator('#rate-map2')
    .getByLabel(
      'Launch multiple maps view with side-by-side maps of each race and ethnicity group'
    )
    .click()
  await expect(page).toHaveURL(/.*multiple-maps2=true/)
  await expect(
    page.getByRole('heading', {
      name: 'People below the poverty line in Georgia across all race and ethnicity groups',
    })
  ).toBeVisible()

  // CLOSE IT
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page).not.toHaveURL(/.*multiple-maps2=true/)
})
