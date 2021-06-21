import { step, TestSettings, By, beforeAll, afterAll, Until } from '@flood/element'

export const settings: TestSettings = {
	userAgent: 'flood-chrome-test',
  clearCache: false,
  clearCookies: false,

	// Automatically wait for elements before trying to interact with them
  loopCount: 1,
	waitUntil: 'visible',
  viewport: { width: 3072, height: 1920 },
}

export default () => {
	beforeAll(async browser => {
		// Run this hook before running the first step
		await browser.wait('500ms')
	})

	afterAll(async browser => {
		// Run this hook after running the last step
		await browser.wait('500ms')
	})

	// If you want to do some actions before/after every single step, use beforeEach/afterEach
	// beforeEach(async browser => {})
	// afterEach(async browser => {})


  // COVID
	step('NATIONAL: Start', async browser => {
		// visit instructs the browser to launch, open a page, and navigate to https://dev.healthequitytracker.org/exploredata
    await browser.authenticate('MSM', 'devsite')
		await browser.visit('https://dev.healthequitytracker.org/exploredata')
	})

  step('NATIONAL: Make sure site loaded', async browser => {
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })

  step('STATE: Make sure site loaded', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.covid-3.20')
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

  //// COUNTY
  step('COUNTY: Click into county', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.covid-3.20143')

    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })

  // HEALTH INSURANCE
	step('NATIONAL: Health Insurace', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.health_insurance-3.00')
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

  step('STATE: HEALTH INSURANCE', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.health_insurance-3.31')
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

  //// COUNTY
  step('COUNTY: HEALTH INSURANCE', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.health_insurance-3.31071')

    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })

  // POVERTY
	step('NATIONAL: Poverty', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.poverty-3.00')
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

  step('STATE: Poverty', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.poverty-3.31')
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

  //// COUNTY
  step('COUNTY: Poverty', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.poverty-3.31071')

    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })

  // COPD
  step('NATIONAL COPD: Make sure site loaded', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.copd-3.00')
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })

  step('STATE COPD: Make sure site loaded', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.copd-3.31')
    let pageTextVerify = By.partialVisibleText('COPD Cases Per 100K People')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })

  // Diabetes
  step('NATIONAL DIABETES: Make sure site loaded', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.diabetes-3.00')
    let pageTextVerify = By.partialVisibleText('Compare across')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })

  step('STATE DIABETES: Make sure site loaded', async browser => {
		await browser.visit('https://dev.healthequitytracker.org/exploredata?mls=1.diabetes-3.20')
    let pageTextVerify = By.partialVisibleText('Diabetes Cases Per 100K People')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
  })
}
