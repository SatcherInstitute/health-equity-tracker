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
 * The numerator download requires only a name and email (no account, no payment). It opens
 * a headed browser (required to pass Cloudflare), fills a modal form, re-applies the
 * "Show All Years" filter (the modal resets it), runs a Search, then clicks Download CSV.
 * The server-side export takes roughly 30 minutes before a download link appears.
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
  'https://cawp.rutgers.edu/data/women-elected-officials-database'
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  last_run?: string // legacy key written by the old Python script
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
  const ts = entry.lastRun ?? entry.last_run // last_run = legacy Python format
  if (!ts) return false
  const diffMs = Date.now() - new Date(ts).getTime()
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
      const last = (cache[key].lastRun ?? cache[key].last_run ?? '').slice(0, 10)
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
    const last = (cache[key].lastRun ?? cache[key].last_run ?? '').slice(0, 10)
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
      .map((f) => (cache[`state_leg_${f}`]?.lastRun ?? cache[`state_leg_${f}`]?.last_run)?.slice(0, 10))
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
    const last = (cache[key].lastRun ?? cache[key].last_run ?? '').slice(0, 10)
    console.log(`  Fresh (last run ${last}), skipping`)
    return
  }

  // Flow (CAWP's form-gated export, ~30 min total):
  //   1. Navigate to the "All Data" tab (includes all office levels — Congress, State Leg, Territorial)
  //   2. Click "Download Data" to open the registration modal
  //   3. Fill name + email, click "Download Data" to close the modal
  //   4. Re-apply "Show All Years" — the modal resets the radio to "Currently In Office"
  //   5. Click Search — required to populate all-years results before the download reflects them
  //   6. Click "Download CSV" — triggers a server-side export (~30 min); a link appears when done
  //   7. Save the file via the auto-download event or by clicking the resulting link
  //
  // Cloudflare: headless mode is blocked; headed mode with AutomationControlled suppressed passes.
  console.log('  Opening browser window (Cloudflare requires non-headless)...')
  console.log('  Export takes ~30 minutes - please do not close the browser.')
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
    await page.goto(CAWP_NUMERATOR_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await page.waitForTimeout(2000)

    // Step 1: open the download modal
    console.log('  Opening download modal...')
    await page.getByRole('button', { name: /download data/i }).first().click()
    await page.waitForTimeout(1500)

    // Step 2: fill in name + email (no account needed)
    const firstNameField = page.locator('input[name*="first"], input[placeholder*="First"]').first()
    const emailField = page.locator('input[type="email"], input[name*="email"], input[placeholder*="mail"]').first()
    await firstNameField.fill('HET')
    await emailField.fill('data@healthequitytracker.org')

    // Step 3: submit the modal — closes it and returns to the main page
    console.log('  Submitting modal form...')
    await page.getByRole('button', { name: /download data/i }).last().click()
    await page.waitForTimeout(2000)

    // Step 4: Re-apply "Show All Years" — the modal submission resets the radio to
    // "Currently In Office". After re-selecting, click Search to populate all-years results.
    // Leave Level of Office blank (no filter = all levels included).
    console.log('  Re-applying Show All Years and running search...')
    await page.getByLabel(/show all years/i).first().click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /^search$/i }).first().click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const resultCount = await page.locator('text=/Displaying.*unique individuals/').first().textContent()
    console.log(`  Search result: ${resultCount?.trim() ?? 'unknown'}`)

    // Step 5: click "Download CSV"
    console.log('  Starting CSV export (~30 min)...')
    await page.getByRole('button', { name: /download csv/i })
      .or(page.getByRole('link', { name: /download csv/i }))
      .first()
      .click()

    // Step 6: wait for the progress bar to finish and the download link to appear.
    // The page shows: "Export complete. Download the file here if not automatically downloaded."
    // Listen for an auto-download event in parallel with polling for the link.
    let downloadSaved = false
    page.once('download', async (dl) => {
      console.log('  Auto-download event fired — saving...')
      await dl.saveAs(dest)
      downloadSaved = true
    })

    const EXPORT_TIMEOUT_MS = 45 * 60 * 1000
    const exportEnd = Date.now() + EXPORT_TIMEOUT_MS

    while (Date.now() < exportEnd) {
      await page.waitForTimeout(3000)
      if (downloadSaved) break

      const dlLink = await page.$('a[href*="views_data_export"], a[href*="search_officeholders"]')
      if (dlLink) {
        console.log('  Export complete — downloading via link...')
        const [dl] = await Promise.all([
          page.waitForEvent('download', { timeout: 60000 }),
          dlLink.click(),
        ])
        await dl.saveAs(dest)
        downloadSaved = true
        break
      }
    }

    if (!downloadSaved) {
      await page.screenshot({ path: '/tmp/cawp-export-timeout.png' })
      throw new Error('Export timed out after 45 minutes. Screenshot: /tmp/cawp-export-timeout.png')
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
