#!/usr/bin/env tsx
// Diagnostic: watch batch network traffic to see if op=do requests succeed
import { chromium } from '@playwright/test'

const CAWP_NUMERATOR_URL =
  'https://cawp.rutgers.edu/women-elected-officials/race-ethnicity'
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

const browser = await chromium.launch({
  headless: false,
  args: ['--disable-blink-features=AutomationControlled'],
})
const context = await browser.newContext({
  userAgent: BROWSER_UA,
  viewport: { width: 1280, height: 800 },
})
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
})
const page = await context.newPage()

page.on('request', (req) => {
  if (req.url().includes('/batch')) console.log(`REQ ${req.method()} ${req.url()}`)
})
page.on('response', async (res) => {
  if (res.url().includes('/batch')) {
    let body = ''
    try {
      body = (await res.text()).slice(0, 300)
    } catch {
      body = '(unreadable)'
    }
    console.log(`RES ${res.status()} ${res.url()} | ${body}`)
  }
})

const filteredUrl =
  `${CAWP_NUMERATOR_URL}?current=2&yearend_filter=All` +
  '&level[]=Federal+Congress&level[]=State+Legislative&level[]=Territorial%2FDC+Legislative'
await page.goto(filteredUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(3000)
await page.evaluate(() => {
  const f = document.querySelector('.feed-icons') as HTMLElement
  if (f) f.style.display = 'block'
})

const csvLink = await page.$('a[href*="export-roles/csv"]')
if (!csvLink) {
  console.log('ERROR: no CSV link found')
  await browser.close()
  process.exit(1)
}

console.log('Clicking CSV link...')
await csvLink.click()

// Log all batch responses including the final completion response
let lastResponse = ''
page.on('response', async (res) => {
  if (!res.url().includes('op=do')) return
  try {
    const json = await res.json() as { status: boolean; percentage?: string; message?: string; redirect?: string }
    lastResponse = JSON.stringify(json)
    if (json.status === false) {
      console.log(`BATCH_COMPLETE: ${JSON.stringify(json)}`)
    }
  } catch { /* ignore */ }
})

// Wait up to 15 minutes for completion
let done = false
for (let i = 0; i < 180 && !done; i++) {
  await page.waitForTimeout(5000)
  const url = page.url()
  const title = await page.title().catch(() => '')
  const progress = await page.$eval('#updateprogress', (el) => el.textContent?.trim()).catch(() => '?')
  if (i % 6 === 0) console.log(`[${i * 5}s] ${url} | ${progress}`)
  if (!url.includes('/batch?id=') || title === '' || title.includes('Download')) {
    console.log(`URL_CHANGED: ${url}`)
    console.log(`TITLE: ${title}`)
    done = true
  }
}
console.log(`Final URL: ${page.url()}`)
console.log(`Final title: ${await page.title()}`)
console.log(`Last batch response: ${lastResponse}`)
await browser.close()
