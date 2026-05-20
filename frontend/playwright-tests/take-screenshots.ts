/**
 * Standalone script: takes feature screenshots of the Data Downloads category filter.
 * Run with: npx tsx playwright-tests/take-screenshots.ts
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = 'pr-screenshots'

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto(`${BASE_URL}/datacatalog`, { waitUntil: 'commit' })
  await page.waitForSelector('div[data-testid]', { timeout: 15000 })
  await page.waitForTimeout(400)

  // 1 — Full page: filter bar + cards with tags
  await page.screenshot({ path: `${OUT_DIR}/01-initial-state.png` })
  console.info('✓ 01-initial-state.png')

  // 2 — Scroll to top to show filter bar, zoom in on it
  await page.evaluate(() => window.scrollTo(0, 0))
  const filterBar = page.getByText('Filter by topic').locator('..')
  await filterBar.screenshot({ path: `${OUT_DIR}/02-filter-bar.png` })
  console.info('✓ 02-filter-bar.png')

  // 3 — HIV filter active
  await filterBar.getByRole('button', { name: 'HIV', exact: true }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT_DIR}/03-hiv-filter-active.png` })
  console.info('✓ 03-hiv-filter-active.png')

  // 4 — Multi-select: HIV + Cancer
  await filterBar.getByRole('button', { name: 'Cancer', exact: true }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT_DIR}/04-multi-select-hiv-cancer.png` })
  console.info('✓ 04-multi-select-hiv-cancer.png')

  // 5 — Filter bar close-up showing both active buttons
  await filterBar.screenshot({ path: `${OUT_DIR}/05-filter-bar-multi-active.png` })
  console.info('✓ 05-filter-bar-multi-active.png')

  await browser.close()
  console.info(`\nScreenshots saved to ./${OUT_DIR}/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
