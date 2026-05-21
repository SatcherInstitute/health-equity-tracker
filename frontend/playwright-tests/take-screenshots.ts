/**
 * Standalone script: takes feature screenshots of the Data Downloads category filter.
 * Run with: npx tsx playwright-tests/take-screenshots.ts
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = 'pr-screenshots'

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
]

async function captureViewport(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  viewport: (typeof VIEWPORTS)[number],
) {
  const page = await browser.newPage()
  await page.setViewportSize({ width: viewport.width, height: viewport.height })

  await page.goto(`${BASE_URL}/datacatalog`, { waitUntil: 'commit' })
  await page.waitForSelector('article', { timeout: 15000 })
  await page.waitForTimeout(500)

  const p = (name: string) =>
    `${OUT_DIR}/${viewport.name}-${name}.png`

  // 1 — Initial state: filter bar + cards with tags
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: p('01-initial'), fullPage: false })
  console.info(`✓ ${viewport.name}-01-initial.png`)

  // 2 — Filter bar close-up
  const filterBar = page.getByText('Filter by topic').locator('..')
  await filterBar.screenshot({ path: p('02-filter-bar') })
  console.info(`✓ ${viewport.name}-02-filter-bar.png`)

  // 3 — HIV filter active (single category)
  await filterBar.getByRole('button', { name: 'HIV', exact: true }).click()
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: p('03-hiv-active'), fullPage: false })
  console.info(`✓ ${viewport.name}-03-hiv-active.png`)

  // 4 — Multi-select: HIV + Cancer (union / OR logic)
  await filterBar.getByRole('button', { name: 'Cancer', exact: true }).click()
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: p('04-hiv-cancer-multi'), fullPage: false })
  console.info(`✓ ${viewport.name}-04-hiv-cancer-multi.png`)

  // 5 — Filter bar showing both active buttons
  await filterBar.screenshot({ path: p('05-filter-bar-multi-active') })
  console.info(`✓ ${viewport.name}-05-filter-bar-multi-active.png`)

  await page.close()
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  for (const viewport of VIEWPORTS) {
    console.info(`\n── ${viewport.name} (${viewport.width}×${viewport.height}) ──`)
    await captureViewport(browser, viewport)
  }

  await browser.close()
  console.info(`\nAll screenshots saved to ./${OUT_DIR}/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
