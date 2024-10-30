import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'parallel' })

test.describe('Home to COVID Vax by Age', () => {
  test('Tracker Default to Covid Vax', async ({ page }) => {
    // Load Tracker Default helper view
    await page.goto(`/exploredata`, { waitUntil: 'commit' })

    // Stop the pulsing button so we can target it
    await page.emulateMedia({ reducedMotion: 'reduce' })

    // Choose VAXX from the no topic screen
    const madLibTopic = await page.waitForSelector(
      'button:visible:has-text("select a topic")',
    )
    await madLibTopic.click()
    const covidVaxOption = await page.waitForSelector(
      'span:has-text("COVID-19 Vaccinations")',
    )
    await covidVaxOption.click()
    await expect(page).toHaveURL(/.*mls=1.covid_vaccinations-3.00/)

    // Back button works properly for madlib condition changes
    await page.goBack()
    await expect(page).not.toHaveURL(/.*mls=1.covid_vaccinations-3.00/)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('iframe')
      .analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
