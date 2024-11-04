import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

test.describe('Home to COVID Vax by Age', () => {
  test('Tracker Default to Covid Vax', async ({ page }) => {
    await page.goto(`/exploredata`, { waitUntil: 'commit' })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.getByRole('button', { name: 'select a topic' }).click()
    await page.getByRole('button', { name: 'COVID-19 Vaccinations' }).click()

    await expect(page).toHaveURL(/.*mls=1.covid_vaccinations-3.00&group1=All/)

    // Check back button functionality for madlib condition changes
    await page.goBack()
    await expect(page).toHaveURL('/exploredata?')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('iframe') // YouTube embed is not fully accessible
      .analyze()

    // Confirm no accessibility violations
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
