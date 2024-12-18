import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

test.describe('Guided tour of COVID-19 from Landing Page', () => {
  test('Guided Tour Link from Landing Page', async ({ page }) => {
    // Landing Page Loads
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(
      page.getByRole('heading', {
        name: 'How do I use the Health Equity Tracker?',
      }),
    ).toBeVisible()

    // Find and click the first "Take a guided tour" link
    const tourLink = page.locator('text=Take a guided tour').first()
    await tourLink.click()

    // First panel displays correct heading
    await expect(
      page.getByRole('heading', { name: 'Start Your Search', exact: true }),
    ).toBeVisible()

    // Clicking next button goes to the next step
    await page.getByRole('button', { name: 'Next' }).click()

    // Second panel displays correct heading
    await expect(
      page.getByRole('heading', {
        name: 'Compare demographics, locations, and health topics',
        exact: true,
      }),
    ).toBeVisible()
  })
})
