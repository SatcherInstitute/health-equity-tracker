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
 *   --levels LIST     Comma-separated Level of Office values to download for the numerator.
 *                     Default: congress,state_leg,territorial
 *                     Available: congress, state_leg, territorial, statewide
 *                     Each level is downloaded separately then concatenated, which keeps
 *                     individual exports small enough to avoid CAWP server timeouts.
 *
 * Cache: each section records its last-run timestamp in data/cawp/.refresh_cache.json.
 * By default the script skips any section that ran successfully within the last 30 days.
 * Individual failed states are retried on the next run even within the cache window.
 * The numerator cache key includes the level set, so changing --levels triggers a re-run.
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
 * "Show All Years" filter (the modal resets it), sets the Level of Office filter, runs
 * Search, then clicks Download CSV. Each level's export takes roughly 15-30 minutes.
 * Run via: npm run refresh-cawp -- --section numerator
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
// Per-level exports are much smaller than an all-levels download, so 45 min per level is
// generous. The retry loop (MAX_DOWNLOAD_ATTEMPTS) handles transient 502s from the CAWP
// Drupal batch processor.
const EXPORT_TIMEOUT_MS = 45 * 60 * 1000

// Maps short keys (used in --levels arg and cache keys) to the option text CAWP uses in
// the Level of Office select. DEFAULT_LEVELS are the three currently ingested by HET.
// Add new keys here once ingestion support exists — they will not run by default.
const LEVEL_OPTION_TEXT: Record<string, string> = {
  congress: 'Congress',
  state_leg: 'State Legislative',
  territorial: 'Territorial/D.C.',
  statewide: 'Statewide',
}
const DEFAULT_LEVELS = ['congress', 'state_leg', 'territorial']

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
async function refreshNumerator(
  cache: Cache,
  force: boolean,
  levels: string[],
): Promise<void> {
  console.log(
    '\n--- CAWP numerator data (women by race/ethnicity time series) ---',
  )

  // Include the sorted level set in the cache key so changing --levels triggers a re-run.
  const key = `numerator_${[...levels].sort().join('_')}`
  const dest = join(DATA_DIR, CAWP_NUMERATOR_FILE)

  if (!force && isFresh(cache, key)) {
    const last = (cache[key].lastRun ?? cache[key].last_run ?? '').slice(0, 10)
    console.log(`  Fresh (last run ${last}, levels: ${levels.join(',')}), skipping`)
    return
  }

  const unknownLevels = levels.filter((l) => !(l in LEVEL_OPTION_TEXT))
  if (unknownLevels.length > 0) {
    throw new Error(
      `Unknown level(s): ${unknownLevels.join(', ')}. ` +
      `Available: ${Object.keys(LEVEL_OPTION_TEXT).join(', ')}`,
    )
  }

  // Flow: one browser session, modal filled once, then one Search+Download per level.
  // Each level is downloaded to a temp file then concatenated into the final dest.
  // Downloading per level keeps files small enough to avoid CAWP server 502s.
  //
  //   1. Navigate to the "All Data" tab
  //   2. Fill + submit the registration modal (only needed once per session)
  //   For each level:
  //   3. Re-apply "Show All Years" (modal resets it) + set Level of Office filter
  //   4. Click Search to populate results for this level
  //   5. Click "Download CSV" — Drupal batch export, 15-30 min per level
  //   6. Save to a temp file
  //   Concatenate all temp files into the final CSV.
  //
  // Cloudflare: headless mode is blocked; headed mode with AutomationControlled suppressed passes.
  console.log(`  Levels: ${levels.join(', ')}`)
  console.log('  Opening browser window (Cloudflare requires non-headless)...')
  console.log('  Export takes ~15-30 min per level — please do not close the browser.')

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

  // Helper: apply filters (Show All Years + level) and run Search.
  // Called once per level, and again on retries.
  const applyFiltersAndSearch = async (level: string): Promise<void> => {
    await page.goto(CAWP_NUMERATOR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.getByLabel(/show all years/i).first().click()
    await page.waitForTimeout(500)
    // Set Level of Office select to this level's option text.
    const optionText = LEVEL_OPTION_TEXT[level]
    await page.getByLabel(/level of office/i).first().selectOption({ label: optionText })
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /^search$/i }).first().click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    const resultCount = await page
      .locator('text=/Displaying.*unique individuals/')
      .first()
      .textContent()
      .catch(() => null)
    console.log(`    Result: ${resultCount?.trim() ?? 'unknown'}`)
  }

  // Helper: click Download CSV and wait for the Drupal batch export to complete.
  // Returns 'success' | '502' | 'timeout'.
  const attemptDownload = async (
    tmpDest: string,
  ): Promise<'success' | '502' | 'timeout'> => {
    let saved = false
    let got502 = false

    page.once('download', async (dl) => {
      await dl.saveAs(tmpDest)
      saved = true
    })
    const onResponse = (r: import('@playwright/test').Response): void => {
      if (r.status() === 502) got502 = true
    }
    page.on('response', onResponse)

    try {
      await page
        .getByRole('button', { name: /download csv/i })
        .or(page.getByRole('link', { name: /download csv/i }))
        .first()
        .click()

      const end = Date.now() + EXPORT_TIMEOUT_MS
      while (Date.now() < end) {
        await page.waitForTimeout(5000)
        if (saved) return 'success'
        if (got502) return '502'
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 3000 })
          const dlLink = await page.$(
            'a[href*="views_data_export"], a[href*="search_officeholders"]',
          )
          if (dlLink) {
            const [dl] = await Promise.all([
              page.waitForEvent('download', { timeout: 60000 }),
              dlLink.click(),
            ])
            await dl.saveAs(tmpDest)
            return 'success'
          }
        } catch {
          // Page navigating through batch steps — keep waiting.
        }
      }
      return 'timeout'
    } finally {
      page.off('response', onResponse)
    }
  }

  const MAX_ATTEMPTS = 3
  const tempFiles: string[] = []

  try {
    // Fill the modal once at session start.
    await page.goto(CAWP_NUMERATOR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    console.log('  Opening download modal...')
    await page.getByRole('button', { name: /download data/i }).first().click()
    await page.waitForTimeout(1500)
    const firstNameField = page
      .locator('input[name*="first"], input[placeholder*="First"]')
      .first()
    const emailField = page
      .locator('input[type="email"], input[name*="email"], input[placeholder*="mail"]')
      .first()
    await firstNameField.fill('HET')
    await emailField.fill('data@healthequitytracker.org')
    console.log('  Submitting modal...')
    await page.getByRole('button', { name: /download data/i }).last().click()
    await page.waitForTimeout(2000)

    // Download each level separately.
    for (const level of levels) {
      const optionText = LEVEL_OPTION_TEXT[level]
      const tmpDest = join(DATA_DIR, `.tmp_numerator_${level}.csv`)
      console.log(`\n  [${level}] Applying filters...`)

      let success = false
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        await applyFiltersAndSearch(level)
        console.log(`  [${level}] Downloading (attempt ${attempt}/${MAX_ATTEMPTS})...`)
        const result = await attemptDownload(tmpDest)
        if (result === 'success') {
          const rows = readFileSync(tmpDest, 'utf8').split('\n').filter((l) => l.trim()).length
          console.log(`  [${level}] Saved ${rows} rows (${optionText})`)
          tempFiles.push(tmpDest)
          success = true
          break
        }
        console.log(`  [${level}] Attempt ${attempt} ${result} — ${attempt < MAX_ATTEMPTS ? 'retrying' : 'giving up'}.`)
      }
      if (!success) {
        await page.screenshot({ path: `/tmp/cawp-export-fail-${level}.png` })
        throw new Error(
          `Export failed for level "${optionText}" after ${MAX_ATTEMPTS} attempts. ` +
          `Screenshot: /tmp/cawp-export-fail-${level}.png`,
        )
      }
    }

    // Concatenate: keep header from first file, strip it from the rest.
    const combined = tempFiles
      .map((f, i) => {
        const content = readFileSync(f, 'utf8').trimEnd()
        return i === 0 ? content : content.split('\n').slice(1).join('\n')
      })
      .filter(Boolean)
      .join('\n') + '\n'

    writeFileSync(dest, combined)
    markDone(cache, key)

    const totalRows = combined.split('\n').filter((l) => l.trim()).length
    console.log(`\n  Combined ${levels.length} levels → ${totalRows} rows saved to ${CAWP_NUMERATOR_FILE}`)
  } catch (e) {
    throw new Error(`Numerator download failed: ${e}`)
  } finally {
    for (const f of tempFiles) {
      try { rmSync(f) } catch { /* ignore */ }
    }
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
    levels: { type: 'string' },
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
const levels = (values.levels ?? DEFAULT_LEVELS.join(','))
  .split(',')
  .map((l) => l.trim())
  .filter(Boolean)

console.log(
  `CAWP data refresh  |  cache TTL: ${CACHE_TTL_DAYS} days  |  force: ${String(force)}`,
)
console.log(`Output directory: ${DATA_DIR}\n`)

mkdirSync(DATA_DIR, { recursive: true })
const cache = loadCache()

const runAll = section == null
if (runAll || section === 'numerator') await refreshNumerator(cache, force, levels)
if (runAll || section === 'congress_json')
  await refreshCongressJson(cache, force)
if (runAll || section === 'crosswalk') await refreshCrosswalk(cache, force)
if (runAll || section === 'state_leg') await refreshStateLegTables(cache, force)

// Note: territories (11, 60, 66, 69, 72, 78) are maintained as manual CSV files
// and are not scraped by this script.

console.log('\nDone. Review changes with: git diff data/cawp/')
console.log('Then commit and re-run the relevant DAG pipelines.')
