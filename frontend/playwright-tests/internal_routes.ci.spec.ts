import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

test('Methodology Hub Loads', async ({ page }) => {
  await page.goto('/methodology', { waitUntil: 'commit' })
  const mainSection = page.locator('section#main-content')
  await expect(mainSection).toContainText('We are committed')
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Policy Hub Loads', async ({ page }) => {
  await page.goto('/policy', { waitUntil: 'commit' })
  await expect(page.getByLabel('Policy Context Introduction')).toContainText(
    'Understanding the Crisis of Gun Violence in Atlanta',
  )
  // mimic reduced motion to prevent animation, which was causing contrast a11y error
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const accessibilityScanResults = await new AxeBuilder({ page })
    .exclude('.text-tinyTag')
    .exclude('.shadow-raised-tighter')
    .analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Age-Adjustment Redirects to Age-Adjustment Page of Methodology Hub', async ({
  page,
}) => {
  await page.goto('/ageadjustment', { waitUntil: 'commit' })
  const mainSection = page.locator('main#main')
  await expect(mainSection).toBeVisible()
  const mainHeading = mainSection.locator('h1#page-heading')
  await expect(mainHeading).toHaveText('Age-Adjustment')
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('About Us Page Loads', async ({ page }) => {
  await page.goto('/aboutus', { waitUntil: 'commit' })
  const mainSection = page.locator('main#main')
  const mainHeading = mainSection.locator('h1#main')
  await expect(mainHeading).toHaveText('About the Health Equity Tracker')
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Terms of Use Page Loads', async ({ page }) => {
  await page.goto('/termsofuse', { waitUntil: 'commit' })
  const mainSection = page.locator('main#main')
  const mainHeading = mainSection.locator('h2#main')
  await expect(mainHeading).toHaveText('Terms of Use')
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
