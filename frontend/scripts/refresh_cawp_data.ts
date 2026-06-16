#!/usr/bin/env tsx

/**
 * Refresh all locally-cached CAWP source data files.
 *
 * Run from frontend/:
 *   npm run refresh-cawp
 *
 * Or from repo root with tsx installed:
 *   tsx scripts/refresh_cawp_data.ts [--force] [--section SECTION]
 *
 * Options:
 *   --force           Bypass the 30-day freshness cache and re-download everything
 *   --section NAME    Only run one section: numerator | state_leg | congress_json | crosswalk
 *
 * Cache: each section records its last-run timestamp in data/cawp/.refresh_cache.json.
 * By default the script skips any section that ran successfully within the last 30 days.
 * Individual failed states are retried on the next run even within the cache window.
 *
 * What this updates:
 *   data/cawp/cawp-by_race_and_ethnicity_time_series.csv  numerator: women by race/ethnicity
 *   data/cawp/cawp_state_leg_{fips}.csv  50 state legislature denominator tables
 *   data/cawp/legislators-historical.json  US Congress historical (unitedstates.io)
 *   data/cawp/legislators-current.json     US Congress current (unitedstates.io)
 *   data/cawp/tab20_cd11820_county20_natl.txt  118th Congress county crosswalk (Census)
 *
 * The numerator download requires no account. It uses Drupal's Views Data Export batch
 * processor (~12 min for 100k rows) and requires a headed browser to pass Cloudflare.
 * Run via: npm run refresh-cawp -- --section numerator
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { type Browser, chromium } from '@playwright/test'

// --- Paths ---
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(SCRIPT_DIR, '..', '..')
const DATA_DIR = join(REPO_ROOT, 'data', 'cawp')
const CACHE_FILE = join(DATA_DIR, '.refresh_cache.json')

// --- Constants ---
const CACHE_TTL_DAYS = 30
const CRAWL_DELAY_MS = 2000

const CONGRESS_HISTORICAL_URL =
  'https://unitedstates.github.io/congress-legislators/legislators-historical.json'
const CONGRESS_CURRENT_URL =
  'https://unitedstates.github.io/congress-legislators/legislators-current.json'
const CROSSWALK_URL =
  'https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/tab20_cd11820_county20_natl.txt'
const CAWP_STATE_INFO_BASE =
  'https://cawp.rutgers.edu/facts/state-state-information/'
const CAWP_NUMERATOR_URL =
  'https://cawp.rutgers.edu/women-elected-officials/race-ethnicity'
const CAWP_NUMERATOR_FILE = 'cawp-by_race_and_ethnicity_time_series.csv'

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

// Column header that identifies the legislature denominator table on each state page
const STLEG_TOTAL_COL = 'Total Women/Total Legislature'

const FIPS_TO_STATE_SLUG: Record<string, string> = {
  '01': 'alabama',
  '02': 'alaska',
  '04': 'arizona',
  '05': 'arkansas',
  '06': 'california',
  '08': 'colorado',
  '09': 'connecticut',
  '10': 'delaware',
  '12': 'florida',
  '13': 'georgia',
  '15': 'hawaii',
  '16': 'idaho',
  '17': 'illinois',
  '18': 'indiana',
  '19': 'iowa',
  '20': 'kansas',
  '21': 'kentucky',
  '22': 'louisiana',
  '23': 'maine',
  '24': 'maryland',
  '25': 'massachusetts',
  '26': 'michigan',
  '27': 'minnesota',
  '28': 'mississippi',
  '29': 'missouri',
  '30': 'montana',
  '31': 'nebraska',
  '32': 'nevada',
  '33': 'new-hampshire',
  '34': 'new-jersey',
  '35': 'new-mexico',
  '36': 'new-york',
  '37': 'north-carolina',
  '38': 'north-dakota',
  '39': 'ohio',
  '40': 'oklahoma',
  '41': 'oregon',
  '42': 'pennsylvania',
  '44': 'rhode-island',
  '45': 'south-carolina',
  '46': 'south-dakota',
  '47': 'tennessee',
  '48': 'texas',
  '49': 'utah',
  '50': 'vermont',
  '51': 'virginia',
  '53': 'washington',
  '54': 'west-virginia',
  '55': 'wisconsin',
  '56': 'wyoming',
}

// --- Types ---
interface CacheEntry {
  lastRun: string
  etag?: string
  lastModified?: string
}
type Cache = Record<string, CacheEntry>

// --- Cache helpers ---
function loadCache(): Cache {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8')) as Cache
  }
  return {}
}

function saveCache(cache: Cache): void {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

function isFresh(cache: Cache, key: string, ttlDays = CACHE_TTL_DAYS): boolean {
  const entry = cache[key]
  if (!entry) return false
  const diffMs = Date.now() - new Date(entry.lastRun).getTime()
  return diffMs < ttlDays * 24 * 60 * 60 * 1000
}

function markDone(cache: Cache, key: string): void {
  if (!cache[key]) cache[key] = { lastRun: '' }
  cache[key].lastRun = new Date().toISOString()
  saveCache(cache)
}

// --- HTTP helpers ---
async function fetchIfChanged(
  url: string,
  dest: string,
  cache: Cache,
  cacheKey: string,
): Promise<boolean> {
  const headers: Record<string, string> = {}
  const cached = cache[cacheKey] ?? {}

  if (existsSync(dest)) {
    if (cached.etag) headers['If-None-Match'] = cached.etag
    else if (cached.lastModified)
      headers['If-Modified-Since'] = cached.lastModified
  }

  const res = await fetch(url, { headers })

  if (res.status === 304) {
    console.log(`  Unchanged (304) - skipping ${basename(dest)}`)
    return false
  }

  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)

  const buffer = await res.arrayBuffer()
  writeFileSync(dest, Buffer.from(buffer))

  if (!cache[cacheKey]) cache[cacheKey] = { lastRun: '' }
  cache[cacheKey].lastRun = new Date().toISOString()
  cache[cacheKey].etag = res.headers.get('etag') ?? undefined
  cache[cacheKey].lastModified = res.headers.get('last-modified') ?? undefined
  saveCache(cache)
  return true
}

// --- Section: Congress JSON ---
async function refreshCongressJson(
  cache: Cache,
  force: boolean,
): Promise<void> {
  console.log('\n--- US Congress JSON (unitedstates.io) ---')
  const sources = [
    { name: 'legislators-historical.json', url: CONGRESS_HISTORICAL_URL },
    { name: 'legislators-current.json', url: CONGRESS_CURRENT_URL },
  ]

  for (const { name, url } of sources) {
    const key = `congress_json_${name}`
    if (!force && isFresh(cache, key)) {
      const last = cache[key].lastRun.slice(0, 10)
      console.log(`  ${name}: fresh (last run ${last}), skipping`)
      continue
    }
    const dest = join(DATA_DIR, name)
    process.stdout.write(`  Downloading ${name}... `)
    const updated = await fetchIfChanged(url, dest, cache, key)
    if (updated) {
      const count = (JSON.parse(readFileSync(dest, 'utf8')) as unknown[]).length
      console.log(`${count} records saved.`)
    }
    markDone(cache, key)
  }
}

// --- Section: County crosswalk ---
async function refreshCrosswalk(cache: Cache, force: boolean): Promise<void> {
  console.log('\n--- Census county-to-congressional-district crosswalk ---')
  const key = 'crosswalk'
  if (!force && isFresh(cache, key)) {
    const last = cache[key].lastRun.slice(0, 10)
    console.log(`  Fresh (last run ${last}), skipping`)
    return
  }
  const dest = join(DATA_DIR, 'tab20_cd11820_county20_natl.txt')
  process.stdout.write('  Downloading crosswalk... ')
  const updated = await fetchIfChanged(CROSSWALK_URL, dest, cache, key)
  if (updated) {
    const lines = readFileSync(dest, 'utf8').split('\n').length
    console.log(`${lines} lines saved.`)
  }
  markDone(cache, key)
}

// --- Section: State leg denominator tables (50 states via Playwright) ---
async function scrapeState(
  browser: Browser,
  fips: string,
  slug: string,
): Promise<string> {
  const context = await browser.newContext({ userAgent: BROWSER_UA })
  const page = await context.newPage()

  try {
    await page.goto(`${CAWP_STATE_INFO_BASE}${slug}`, {
      waitUntil: 'load',
      timeout: 30000,
    })
    await page.waitForTimeout(1500)

    const pageContent = await page.content()
    if (pageContent.includes('Just a moment')) {
      throw new Error('Cloudflare challenge not resolved')
    }

    type TableRow = { year: string; total: string }

    const rows = await page.evaluate(
      ({ totalCol }): TableRow[] | null => {
        const tables = Array.from(document.querySelectorAll('table'))
        for (const table of tables) {
          const headers = Array.from(table.querySelectorAll('th')).map(
            (th) => th.textContent?.trim() ?? '',
          )
          const totalIdx = headers.indexOf(totalCol)
          if (totalIdx === -1) continue

          const yearIdx = headers.indexOf('Year')
          const dataRows = Array.from(
            table.querySelectorAll('tbody tr, tr'),
          ).filter((tr) => tr.querySelectorAll('td').length > 0)

          return dataRows.map((tr) => {
            const cells = Array.from(tr.querySelectorAll('td'))
            return {
              year: cells[yearIdx]?.textContent?.trim() ?? '',
              total: cells[totalIdx]?.textContent?.trim() ?? '',
            }
          })
        }
        return null
      },
      { totalCol: STLEG_TOTAL_COL },
    )

    if (!rows) {
      throw new Error(`No table with '${STLEG_TOTAL_COL}' column found`)
    }

    const csvLines = rows
      .filter((r) => r.year.length > 0)
      .map((r) => {
        // Extract total legislature count from "X women / Y total" format.
        // Source values like "1982*" or missing rows are preserved as-is from CAWP.
        const denominator = r.total.split('/')[1]?.match(/(\d+)/)?.[1] ?? ''
        return `${r.year},${fips},${denominator}`
      })

    return `time_period,state_fips,total_state_leg_count\n${csvLines.join('\n')}\n`
  } finally {
    await context.close()
  }
}

async function refreshStateLegTables(
  cache: Cache,
  force: boolean,
): Promise<void> {
  console.log(
    '\n--- CAWP state legislature denominator tables (50 states via Playwright) ---',
  )

  const statesToScrape = Object.entries(FIPS_TO_STATE_SLUG).filter(([fips]) => {
    const key = `state_leg_${fips}`
    const outPath = join(DATA_DIR, `cawp_state_leg_${fips}.csv`)
    return force || !isFresh(cache, key) || !existsSync(outPath)
  })

  if (statesToScrape.length === 0) {
    const lastDates = Object.keys(FIPS_TO_STATE_SLUG)
      .map((f) => cache[`state_leg_${f}`]?.lastRun?.slice(0, 10))
      .filter((d): d is string => Boolean(d))
      .sort()
    const oldest = lastDates[0] ?? 'unknown'
    console.log(`  All 50 states fresh (oldest: ${oldest}), skipping`)
    return
  }

  console.log(`  Scraping ${statesToScrape.length}/50 states...`)

  const errors: Array<[string, string, string]> = []
  const browser = await chromium.launch({ headless: true })
  const total = statesToScrape.length

  for (let i = 0; i < statesToScrape.length; i++) {
    const [fips, slug] = statesToScrape[i]
    const outPath = join(DATA_DIR, `cawp_state_leg_${fips}.csv`)
    const idx = String(i + 1).padStart(2)

    try {
      const csv = await scrapeState(browser, fips, slug)
      writeFileSync(outPath, csv)
      markDone(cache, `state_leg_${fips}`)
      const rowCount = csv.split('\n').filter((l) => l.trim()).length - 1
      console.log(`  [${idx}/${total}] ${slug.padEnd(22)} ${rowCount} rows`)
    } catch (e) {
      console.log(`  [${idx}/${total}] ${slug.padEnd(22)} FAILED: ${e}`)
      errors.push([fips, slug, String(e)])
    }

    if (i < statesToScrape.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, CRAWL_DELAY_MS))
    }
  }

  await browser.close()

  if (errors.length > 0) {
    console.log(`\n  ${errors.length} states failed (will retry on next run):`)
    for (const [fips, slug, err] of errors) {
      console.log(`    ${fips} ${slug}: ${err}`)
    }
  } else {
    console.log(`\n  All ${total} states saved successfully.`)
  }
}

// --- Section: Numerator (race/ethnicity time series via Playwright form) ---
async function refreshNumerator(cache: Cache, force: boolean): Promise<void> {
  console.log(
    '\n--- CAWP numerator data (women by race/ethnicity time series) ---',
  )

  const key = 'numerator'
  const dest = join(DATA_DIR, CAWP_NUMERATOR_FILE)

  if (!force && isFresh(cache, key)) {
    const last = cache[key].lastRun.slice(0, 10)
    console.log(`  Fresh (last run ${last}), skipping`)
    return
  }

  // The download uses Drupal's Views Data Export batch processor.
  // Flow:
  //   1. Navigate to the filtered URL (full page load — the /views/ajax endpoint is blocked)
  //   2. Reveal the hidden CSV feed link (.feed-icons has display:none; the "Download Data"
  //      button calls toggleModal('download-dialog') but #download-dialog is never rendered)
  //   3. Click the CSV link — Drupal starts a batch job at /batch?id=...
  //   4. The batch processes all rows in ~12 minutes, then fires a download event.
  //      The page URL stays at /batch?id=... throughout — it never navigates away.
  //
  // Cloudflare notes:
  //   - Headless mode is blocked; headed mode passes with AutomationControlled suppressed.
  //   - The AJAX search form (/views/ajax) is blocked, so we use URL params instead.
  console.log('  Opening browser window (Cloudflare requires non-headless)...')
  console.log(
    '  Export batch takes ~12 minutes - please do not close the browser.',
  )
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

  try {
    // Navigate with filter params — avoids the blocked /views/ajax endpoint
    const filteredUrl =
      `${CAWP_NUMERATOR_URL}?current=2&yearend_filter=All` +
      '&level[]=Federal+Congress&level[]=State+Legislative&level[]=Territorial%2FDC+Legislative'
    await page.goto(filteredUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await page.waitForTimeout(3000)

    // Force-show the hidden CSV feed link
    await page.evaluate(() => {
      const feedIcons = document.querySelector('.feed-icons') as HTMLElement
      if (feedIcons) feedIcons.style.display = 'block'
    })

    const csvLink = await page.$('a[href*="export-roles/csv"]')
    if (!csvLink) throw new Error('CSV download link not found in page DOM')

    console.log(
      '  Starting batch export (Drupal will process rows in batches)...',
    )

    await csvLink.click()

    // Give the navigation to /batch?id=... time to happen. Using waitForURL here
    // caused intermittent "Initializing." hangs in testing; a plain wait + URL check
    // matches the approach used in the working diagnostic scripts.
    await page.waitForTimeout(5000)
    if (!page.url().includes('/batch?id=')) {
      throw new Error(
        `CSV link click did not start a batch export (got: ${page.url()})`,
      )
    }
    console.log('  Batch running (~12 min) — progress below...')

    // Avoid page.waitForURL / page.waitForEvent inside Promise.race — these Playwright
    // promise-based waiters intermittently block the batch JS from making progress.
    // Use a raw page.once listener for downloads and a 3-second polling loop for URL
    // changes, which matches the approach used in the working diagnostic scripts.
    let downloadSaved = false
    page.once('download', async (dl) => {
      console.log('  Download event fired — saving...')
      await dl.saveAs(dest)
      downloadSaved = true
    })

    const BATCH_TIMEOUT_MS = 20 * 60 * 1000
    const batchEnd = Date.now() + BATCH_TIMEOUT_MS
    const batchStart = Date.now()
    let lastLogMin = -1

    while (Date.now() < batchEnd) {
      await page.waitForTimeout(3000)
      if (downloadSaved) break

      const currentUrl = page.url()
      if (!currentUrl.includes('/batch?id=')) {
        console.log(`  Batch redirected to: ${currentUrl}`)
        break
      }

      // Log progress every 2 minutes
      const elapsedMin = Math.floor((Date.now() - batchStart) / 60000)
      if (elapsedMin > lastLogMin && elapsedMin % 2 === 0) {
        lastLogMin = elapsedMin
        const progress = await page
          .$eval('#updateprogress', (el) => el.textContent?.trim() ?? '?')
          .catch(() => '?')
        console.log(`  [${elapsedMin} min] ${progress}`)
      }
    }

    if (!downloadSaved && page.url().includes('/batch?id=')) {
      const progress = await page
        .$eval('#updateprogress', (el) => el.textContent?.trim())
        .catch(() => 'unknown')
      throw new Error(`Batch timed out after 20 minutes (progress: ${progress})`)
    }

    if (!downloadSaved) {
      // Batch redirected to a completion page (observed: /download-complete?...).
      // Give the page a moment to fully load.
      await page.waitForTimeout(3000)
      const currentUrl = page.url()
      console.log(`  Batch redirected to: ${currentUrl}`)

      const content = await page.content()
      if (content.includes('Just a moment') || content.includes('challenge-form')) {
        // Cloudflare challenge — use session cookies to fetch directly
        const res = await context.request.get(currentUrl)
        if (!res.ok()) {
          throw new Error(
            `Cloudflare blocked final download (${res.status()})`,
          )
        }
        writeFileSync(dest, await res.text())
      } else {
        // Look for a download/export link on the completion page
        const dlLink = await page.$(
          'a[href*=".csv"], a[href*="export-roles"], a[href*="download"], a[download]',
        )
        if (dlLink) {
          console.log('  Found download link on completion page — clicking...')
          const [dl] = await Promise.all([
            page.waitForEvent('download', { timeout: 60000 }),
            dlLink.click(),
          ])
          await dl.saveAs(dest)
        } else {
          // No link found — the completion URL itself may serve the CSV
          const res = await context.request.get(currentUrl)
          const contentType = res.headers()['content-type'] ?? ''
          if (res.ok() && (contentType.includes('csv') || contentType.includes('text/plain'))) {
            writeFileSync(dest, await res.text())
          } else {
            // Save page screenshot for debugging and report the body
            await page.screenshot({ path: '/tmp/cawp-download-complete.png' })
            const bodySnippet = await page
              .$eval('body', (el) => (el as HTMLElement).innerText?.slice(0, 400))
              .catch(() => '')
            throw new Error(
              `No download link on completion page (${currentUrl}). ` +
              `Screenshot: /tmp/cawp-download-complete.png. Body: ${bodySnippet}`,
            )
          }
        }
      }
    }

    markDone(cache, key)

    const lines = readFileSync(dest, 'utf8')
      .split('\n')
      .filter((l) => l.trim()).length
    console.log(`  Saved ${lines} rows to ${CAWP_NUMERATOR_FILE}`)
  } catch (e) {
    throw new Error(`Numerator download failed: ${e}`)
  } finally {
    await context.close()
    await browser.close()
  }
}

// --- Main ---
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    force: { type: 'boolean', default: false },
    section: { type: 'string' },
  },
  strict: false,
})

const force = values.force ?? false
const section = values.section as
  | 'numerator'
  | 'state_leg'
  | 'congress_json'
  | 'crosswalk'
  | undefined

console.log(
  `CAWP data refresh  |  cache TTL: ${CACHE_TTL_DAYS} days  |  force: ${String(force)}`,
)
console.log(`Output directory: ${DATA_DIR}\n`)

mkdirSync(DATA_DIR, { recursive: true })
const cache = loadCache()

const runAll = section == null
if (runAll || section === 'numerator') await refreshNumerator(cache, force)
if (runAll || section === 'congress_json')
  await refreshCongressJson(cache, force)
if (runAll || section === 'crosswalk') await refreshCrosswalk(cache, force)
if (runAll || section === 'state_leg') await refreshStateLegTables(cache, force)

// Note: territories (11, 60, 66, 69, 72, 78) are maintained as manual CSV files
// and are not scraped by this script.

console.log('\nDone. Review changes with: git diff data/cawp/')
console.log('Then commit and re-run the relevant DAG pipelines.')
