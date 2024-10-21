import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('WIHE Page loads and has correct title and header', async ({ page }) => {
  await page.goto('/whatishealthequity', { waitUntil: 'commit' })

  await expect(page).toHaveTitle(
    'What is Health Equity? - Health Equity Tracker',
  )

  const heading = await page.getByRole('heading', {
    name: 'What is Health Equity?',
    level: 1,
  })
  await expect(heading).toBeVisible()
})

test('WIHE Page Loads and Accessibility Scan', async ({ page }) => {
  await page.goto('/whatishealthequity', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page })
    .disableRules(['landmark-one-main', 'page-has-heading-one'])
    .exclude('.text-tinyTag')
    .exclude('.shadow-raised-tighter')
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

test('Default Guides tab is loaded on /whatishealthequity', async ({
  page,
}) => {
  await page.goto('/whatishealthequity', { waitUntil: 'commit' })

  const guidesTab = await page.getByRole('link', {
    name: 'Data Visualization Guides',
  })
  await expect(guidesTab).toHaveClass(/bg-methodologyGreen/)
})

test('Navigate between Data Visualization Guides and Health Equity Deep Dive tabs', async ({
  page,
}) => {
  await page.goto('/whatishealthequity', { waitUntil: 'commit' })

  const guidesTab = await page.getByRole('link', {
    name: 'Data Visualization Guides',
  })
  await expect(guidesTab).toHaveClass(/bg-methodologyGreen/)

  const deepDiveTab = await page.getByRole('link', {
    name: 'Health Equity Deep Dive',
  })
  await deepDiveTab.click()

  await expect(deepDiveTab).toHaveClass(/bg-methodologyGreen/)
  await expect(guidesTab).not.toHaveClass(/bg-methodologyGreen/)
})

test('Page scrolls to top on navigation', async ({ page }) => {
  await page.goto('/whatishealthequity/external-resources', {
    waitUntil: 'commit',
  })

  await page.goto('/whatishealthequity')
  const scrollY = await page.evaluate(() => window.scrollY)

  expect(scrollY).toBe(0)
})
