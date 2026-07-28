import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

test('Methodology Introduction Tab Loads', async ({ page }) => {
  await page.goto('/methodology', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Methodology Data Sources Tab Loads', async ({ page }) => {
  await page.goto('/methodology/data-sources', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Topic Categories Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Behavioral Health Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/behavioral-health', {
    waitUntil: 'commit',
  })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Chronic Diseases Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/chronic-disease', {
    waitUntil: 'commit',
  })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Community Safety Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/community-safety', {
    waitUntil: 'commit',
  })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('COVID-19 Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/covid', {
    waitUntil: 'commit',
  })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('HIV Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/hiv', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Political Determinants Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/pdoh', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Social Determinants Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/sdoh', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Medication Utilization Tab Loads', async ({ page }) => {
  await page.goto('/methodology/topic-categories/medication-utilization', {
    waitUntil: 'commit',
  })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Data Methods Tab Loads', async ({ page }) => {
  await page.goto('/methodology/definitions', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Limitations Tab Loads', async ({ page }) => {
  await page.goto('/methodology/limitations', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Metrics Tab Loads', async ({ page }) => {
  await page.goto('/methodology/definitions/metrics', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Topic Definitions Tab Loads', async ({ page }) => {
  await page.goto('/methodology/definitions/topic-definitions', {
    waitUntil: 'commit',
  })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Races and Ethnicities Definitions Tab Loads', async ({ page }) => {
  await page.goto('/methodology/definitions/races-and-ethnicities', {
    waitUntil: 'commit',
  })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Age-Adjustment Tab Loads', async ({ page }) => {
  await page.goto('/ageadjustment', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Recommended Citation Tab Loads', async ({ page }) => {
  await page.goto('/methodology/recommended-citation', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('Glossary Tab Loads', async ({ page }) => {
  await page.goto('/methodology/glossary', { waitUntil: 'commit' })
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
