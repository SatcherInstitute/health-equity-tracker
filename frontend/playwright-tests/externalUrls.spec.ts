import { expect, test } from '@playwright/test'
import {
  AIAN_RESOURCES,
  API_RESOURCES,
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
  ECONOMIC_EQUITY_RESOURCES,
  EQUITY_INDEX_RESOURCES,
  HISP_RESOURCES,
  MENTAL_HEALTH_RESOURCES,
  PDOH_RESOURCES,
  RESOURCES,
} from '../src/pages/Methodology/methodologyContent/ResourcesData.js'
// these are actually .ts files but load as .js to prevent some error I forget exactly what
import { urlMap } from '../src/utils/externalUrls.js'

const knownFlakyUrls = [
  'https://satcherinstitute.github.io/analysis/cdc_case_data',
  'https://satcherinstitute.github.io/analysis/cdc_death_data',
  'https://doi.org/10.1111/j.1540-5907.2011.00512.x',
  'https://doi.org/10.1146/annurev.polisci.11.053106.123839',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3222512/',
  'https://www.linkedin.com/in/satcherhealth',
  'https://twitter.com/SatcherHealth',
  'https://twitter.com/repjohnlewis/status/758023941998776321?lang=en',
  'https://www.apha.org/topics-and-issues/communicable-disease/coronavirus/equity',
  'https://www.policylink.org/health-equity-resources',
  'https://www.uihi.org/resources/best-practices-for-american-indian-and-alaska-native-data-collection/',
  'https://www.atsdr.cdc.gov/placeandhealth/svi/documentation/pdf/SVI2018Documentation_01192022_1.pdf',
  'https://www.naccho.org/programs/public-health-infrastructure/health-equity',
  'https://www.naccho.org/programs/public-health-infrastructure/performance-improvement/community-health-assessment/mapp',
  'https://pubmed.ncbi.nlm.nih.gov/21563622/',
  'https://jamanetwork.com/channels/health-forum/fullarticle/2760153',
  urlMap.southernCenterForHumanRights,
  urlMap.randGunPolicy,
  urlMap.cdcTrans
]

test.describe.configure({ mode: 'parallel' })

// TEST Headless Wordpress Endpoint
test(`Fetch First 100 Blog Posts`, async ({ page }) => {
  const url =
    'https://hetblog.dreamhosters.com/wp-json/wp/v2/posts?_embed&per_page=100'
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' })
  if (response?.status() !== 200)
    console.error('\n🙀', url, response?.status(), '\n')
})

for (const url of Object.values(urlMap)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`${url}`, async ({ page }) => {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' })
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`Resource Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of PDOH_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`PDOH_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of EQUITY_INDEX_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`EQUITY_INDEX_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of ECONOMIC_EQUITY_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`ECONOMIC_EQUITY_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of AIAN_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`AIAN_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of API_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`API_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of HISP_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`HISP_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

for (const url of MENTAL_HEALTH_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`MENTAL_HEALTH_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}
for (const url of COVID_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`COVID_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}
for (const url of COVID_VACCINATION_RESOURCES.resources
  .filter((resource) => resource.url)
  .map((fellow) => fellow.url)) {
  if (!url || knownFlakyUrls.includes(url)) continue
  test(`COVID_VACCINATION_RESOURCES Page: ${url}`, async ({ page }) => {
    const response = await page.goto(url)
    if (response?.status() !== 200)
      console.error('\n🙀', url, response?.status(), '\n')
  })
}

test('Verify CAWP denominators from external data source', async ({ page }) => {
  await page.goto(
    'https://www.ncsl.org/resources/details/number-of-legislators-and-length-of-terms-in-years',
  )

  try {
    const rowAS = await page.locator('tr', {
      has: page.locator('td:first-child:text("American Samoa Fono")'), // FIPS 60
    })
    const lastCellAS = await rowAS.locator('td:last-child').textContent()
    expect(lastCellAS?.trim()).toBe('39')

    const rowDC = await page.locator('tr', {
      has: page.locator('td:first-child:text("D.C. Council*")'), // FIPS 11
    })
    const lastCellDC = await rowDC.locator('td:last-child').textContent()
    expect(lastCellDC?.trim()).toBe('13')

    const rowGU = await page.locator('tr', {
      has: page.locator('td:first-child:text("Guam Senate*")'), // FIPS 66
    })
    const lastCellGU = await rowGU.locator('td:last-child').textContent()
    expect(lastCellGU?.trim()).toBe('15')

    const rowMP = await page.locator('tr', {
      has: page.locator('td:first-child:text("Northern Mariana Islands")'), // FIPS 69
    })
    const lastCellMP = await rowMP.locator('td:last-child').textContent()
    expect(lastCellMP?.trim()).toBe('29')

    const rowPR = await page.locator('tr', {
      has: page.locator('td:first-child:text("Puerto Rico")'), // FIPS 72
    })
    const lastCellPR = await rowPR.locator('td:last-child').textContent()
    expect(lastCellPR?.trim()).toBe('78')

    const rowVI = await page.locator('tr', {
      has: page.locator('td:first-child:text("U.S. Virgin Islands Senate*")'), // FIPS 78
    })
    const lastCellVI = await rowVI.locator('td:last-child').textContent()
    expect(lastCellVI?.trim()).toBe('15')
  } catch (e) {
    throw new Error(`❌ If this test fails, it means the data on the NCSL page has changed, meaning one or more territories have a new number of territorial legislators (counting both the local senate and house equivalents where applicable). We need to verify the new number and manually update our data/cawp territory files.

    Original error: ${e.message}`)
  }
})
