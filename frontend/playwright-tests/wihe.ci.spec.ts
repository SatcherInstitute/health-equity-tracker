import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('WIHE Page loads', async ({ page }) => {
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

test('Default Guides tab is loaded on /whatishealthequity', async ({
  page,
}) => {
  await page.goto('/whatishealthequity', { waitUntil: 'commit' })

  const guidesTab = await page.getByRole('button', {
    name: 'Data Visualization Guides',
  })
  await expect(guidesTab).toHaveText('Data Visualization Guides')
})

test('WIHE Page Loads and Accessibility Scan', async ({ page }) => {
  await page.goto('/whatishealthequity', { waitUntil: 'networkidle' })
  await page.waitForSelector('.text-tinyTag', { state: 'attached' })

  const accessibilityScanResults = await new AxeBuilder({ page })
    .exclude('.text-tinyTag')
    .exclude('.shadow-raised-tighter')
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
