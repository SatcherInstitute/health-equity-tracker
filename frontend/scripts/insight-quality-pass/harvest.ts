#!/usr/bin/env tsx
// Harvests generated insights for the launch quality pass (see README.md).
//
// For every view in review-set.json it opens the page the way a visitor would,
// triggers the insight, and records the sentence, its highlight, the rendered
// prompt (the exact data the model saw) and a screenshot of the chart. It then
// writes a worksheet with the rubric as checkboxes so a reviewer can judge each
// insight next to the data it describes and record a verdict.
//
//   npm run insight-pass                       # full set against production
//   npm run insight-pass -- --only O2 --only R1
//   npm run insight-pass -- --cold-read        # the 10-view non-author subset
//   npm run insight-pass -- --tally scripts/insight-quality-pass/results/<run>/worksheet.md
//
// Every opened insight that is not already cached spends one generation
// against the daily ceiling, so views are paced under the per-client limit.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { chromium, type Locator, type Page } from '@playwright/test'

type Surface = 'card' | 'contrast' | 'report'
type Category =
  | 'ordinary'
  | 'sparse'
  | 'suppressed'
  | 'county'
  | 'compare'
  | 'report'

interface ReviewView {
  id: string
  category: Category
  surface: Surface
  hashId?: string
  url: string
  why: string
  coldRead: boolean
}

interface Section {
  label: string
  text: string
  highlight: string | null
}

type Outcome = 'insight' | 'no-insight' | 'error'

interface HarvestedView extends ReviewView {
  fullUrl: string
  outcome: Outcome
  // What the page showed instead of an insight: an error message, the
  // "not enough comparable places" notice, or nothing at all.
  detail: string | null
  sections: Section[]
  promptPath: string | null
  screenshotPath: string | null
  durationMs: number
}

// The codes are the rubric. B* are blocking: one occurrence anywhere in the
// pass blocks launch. N* are non-blocking: the rate is recorded, not gated on.
const BLOCKING = [
  [
    'B1',
    'Factual error about the data (a number, group, place or direction the rows do not support)',
  ],
  ['B2', 'Stigmatizing or person-second language about a demographic group'],
  ['B3', 'Causal claim or explanation the data does not support'],
  [
    'B4',
    'Reveals a suppressed value, or describes missing data as though it were measured',
  ],
] as const

const NON_BLOCKING = [
  [
    'N1',
    'Fluent but empty: restates the chart without saying anything it did not already say',
  ],
  ['N2', 'Reading level drifts above 8th grade, or leans on jargon'],
  ['N3', 'Awkward phrasing, or a highlight that does not carry the finding'],
] as const

const VERDICTS = ['PASS', 'BLOCK', 'NONBLOCK', 'NO_INSIGHT', 'SKIP'] as const

// The reviewer's explicit "nothing applies". Without it a pass looks identical
// to a view nobody has read yet.
const OK_CODE = 'OK'
const OK_LABEL = 'No issues: none of the codes above applies'
type Verdict = (typeof VERDICTS)[number] | 'PENDING'

const DISCLOSURE = /AI-generated\. Click to report/
// The report shows one notice when generation is off or at its ceiling and
// another when a request failed. Only the first is a genuine absence; the
// second means the view has not been judged and must be re-harvested.
const REPORT_UNAVAILABLE = /Report summaries are not available/
const REPORT_FAILED = /Unable to generate insight|Too many requests/
// The one notice a card section shows in place of a sentence when the product
// has decided, rather than failed, not to generate one.
const SECTION_UNAVAILABLE = /Not enough comparable places/
const PROMPT_TIMEOUT_MS = 20_000

const USAGE = `Harvest generated insights for the launch quality pass (see README.md).

  npm run insight-pass                          # full review set against production
  npm run insight-pass -- --only O2 --only R1   # specific views
  npm run insight-pass -- --category suppressed # one category
  npm run insight-pass -- --cold-read           # the 10-view non-author subset
  npm run insight-pass -- --tally scripts/insight-quality-pass/results/<run>/worksheet.md

Options:
  --base-url <url>     Site to harvest from (default https://healthequitytracker.org)
  --output-dir <path>  Where to write results (default results/<date>-<host>)
  --delay-ms <n>       Pause between views, to stay under the per-client rate (default 13000)
  --timeout-ms <n>     How long to wait for an insight before recording its absence (default 60000)
  --chromium <path>    Launch this Chromium binary instead of Playwright's own download
`

const here = dirname(fileURLToPath(import.meta.url))

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'base-url': { type: 'string', default: 'https://healthequitytracker.org' },
    'output-dir': { type: 'string' },
    only: { type: 'string', multiple: true },
    category: { type: 'string', multiple: true },
    'cold-read': { type: 'boolean', default: false },
    // 5 generations a minute per client is the server's allowance; 13 s keeps
    // a run of cache misses under it with a little slack.
    'delay-ms': { type: 'string', default: '13000' },
    // How long to wait for an insight before recording its absence.
    'timeout-ms': { type: 'string', default: '60000' },
    // A preinstalled Chromium, for runners that do not fetch Playwright's own.
    chromium: { type: 'string' },
    tally: { type: 'string' },
    help: { type: 'boolean', default: false },
  },
})

const INSIGHT_TIMEOUT_MS = Number(values['timeout-ms'])

if (values.help) {
  console.info(USAGE)
  process.exit(0)
}

if (values.tally) {
  process.exit(tally(values.tally))
}

await harvest()

// ---------------------------------------------------------------------------

async function harvest() {
  const baseUrl = values['base-url']!.replace(/\/$/, '')
  const delayMs = Number(values['delay-ms'])
  const set = JSON.parse(
    readFileSync(join(here, 'review-set.json'), 'utf8'),
  ) as {
    views: ReviewView[]
  }

  let views = set.views
  if (values['cold-read']) views = views.filter((v) => v.coldRead)
  if (values.only?.length)
    views = views.filter((v) => values.only!.includes(v.id))
  if (values.category?.length)
    views = views.filter((v) => values.category!.includes(v.category))
  if (views.length === 0) {
    console.error('No views matched the filters.')
    process.exit(1)
  }

  const host = new URL(baseUrl).host.replace(/[^a-z0-9.-]/gi, '_')
  const stamp = new Date().toISOString().slice(0, 10)
  const outputDir =
    values['output-dir'] ??
    join(
      here,
      'results',
      `${stamp}-${host}${values['cold-read'] ? '-cold-read' : ''}`,
    )
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true })
  mkdirSync(join(outputDir, 'prompts'), { recursive: true })

  console.info(`Harvesting ${views.length} view(s) from ${baseUrl}`)
  console.info(
    `Up to ${views.length} generations may be spent against the daily ceiling.`,
  )
  console.info(`Output: ${outputDir}\n`)

  const browser = await chromium.launch({ executablePath: values.chromium })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()

  const results: HarvestedView[] = []
  for (const [i, view] of views.entries()) {
    const started = Date.now()
    const fullUrl = `${baseUrl}${view.url}`
    let result: HarvestedView = {
      ...view,
      fullUrl,
      outcome: 'error',
      detail: null,
      sections: [],
      promptPath: null,
      screenshotPath: null,
      durationMs: 0,
    }
    try {
      result = {
        ...result,
        ...(await harvestView(page, view, fullUrl, outputDir)),
      }
    } catch (error) {
      result.detail =
        error instanceof Error ? error.message.split('\n')[0] : String(error)
    }
    result.durationMs = Date.now() - started
    results.push(result)
    const summary =
      result.outcome === 'insight'
        ? result.sections
            .map((s) => s.text)
            .join(' ')
            .slice(0, 110)
        : `${result.outcome}: ${result.detail ?? ''}`
    console.info(`[${view.id}] ${result.outcome.padEnd(10)} ${summary}`)

    if (i < views.length - 1 && delayMs > 0) await page.waitForTimeout(delayMs)
  }

  await browser.close()

  writeFileSync(
    join(outputDir, 'harvest.json'),
    `${JSON.stringify({ baseUrl, harvestedAt: new Date().toISOString(), views: results }, null, 2)}\n`,
  )
  const worksheetName = values['cold-read'] ? 'cold-read.md' : 'worksheet.md'
  writeFileSync(
    join(outputDir, worksheetName),
    values['cold-read']
      ? renderColdRead(results, baseUrl)
      : renderWorksheet(results, baseUrl),
  )

  const counts = countBy(results, (r) => r.outcome)
  console.info(
    `\nDone. ${counts.insight ?? 0} insight(s), ${counts['no-insight'] ?? 0} without an insight, ${counts.error ?? 0} error(s).`,
  )
  console.info(`Worksheet: ${join(outputDir, worksheetName)}`)
}

async function harvestView(
  page: Page,
  view: ReviewView,
  fullUrl: string,
  outputDir: string,
): Promise<Partial<HarvestedView>> {
  await page.goto(fullUrl, { waitUntil: 'domcontentloaded' })

  let container: Locator
  let sections: Section[]
  let shot: Locator

  switch (view.surface) {
    case 'card': {
      const card = page.locator(`#${view.hashId}`)
      await card.scrollIntoViewIfNeeded()
      await card.getByLabel('Generate insight').click()
      container = card.locator('div[role="status"]').first()
      const waited = await awaitInsight(container)
      if (waited.outcome !== 'insight')
        return {
          ...waited,
          screenshotPath: await screenshot(card, view, outputDir),
        }
      sections = [await readSection(container, 'insight')]
      shot = card
      break
    }
    case 'contrast': {
      const card = page.locator(`#${view.hashId}`)
      await card.scrollIntoViewIfNeeded()
      // The row's own button, auto-waited; the page-level fallback covers a
      // layout where the button sits outside the card element.
      try {
        await card
          .getByLabel('Comparison insights')
          .first()
          .click({ timeout: 10_000 })
      } catch {
        await page.getByLabel('Comparison insights').first().click()
      }
      container = page
        .locator('[role="status"][aria-label*="comparison insight"]')
        .first()
      const waited = await awaitInsight(container)
      if (waited.outcome !== 'insight')
        return {
          ...waited,
          screenshotPath: await screenshot(card, view, outputDir),
        }
      sections = [await readSection(container, 'insight')]
      shot = card
      break
    }
    case 'report': {
      // The panel generates on mount, so on domcontentloaded the loader may
      // not exist yet and "hidden" would be satisfied by its absence. Wait for
      // a terminal state instead: the sections, or the notice shown in their
      // place.
      const region = page.getByRole('region', { name: 'Report insights' })
      const notice = page
        .getByText(REPORT_UNAVAILABLE)
        .or(page.getByText(REPORT_FAILED))
        .first()
      await region.or(notice).first().waitFor({ timeout: INSIGHT_TIMEOUT_MS })
      if ((await region.count()) === 0) {
        const shown = (
          (await notice.textContent().catch(() => null)) ??
          'report panel rendered no sections'
        ).trim()
        return {
          outcome: REPORT_UNAVAILABLE.test(shown) ? 'no-insight' : 'error',
          detail: shown,
          screenshotPath: await screenshot(
            page.locator('#rate-map'),
            view,
            outputDir,
          ),
        }
      }
      container = region
      const paragraphs = region.locator('p')
      const labels = [
        'Key Findings',
        'Location Comparison',
        'Demographic Insights',
        'What This Means',
      ]
      sections = []
      for (let i = 0; i < labels.length; i++) {
        const p = paragraphs.nth(i)
        sections.push({
          label: labels[i],
          text: ((await p.textContent()) ?? '').trim(),
          highlight: await highlightOf(p),
        })
      }
      shot = region.locator(
        'xpath=ancestor::div[contains(@class,"bg-alt-white")][1]',
      )
      break
    }
  }

  const promptPath = await capturePrompt(page, container, view, outputDir)
  const screenshotPath = await screenshot(shot, view, outputDir)
  // Without the prompt there are no rows to check B1 and B4 against, so the
  // view is not reviewable. Keep what was captured, but record it as a
  // failure so the worksheet leaves it PENDING and the tally refuses a GO.
  if (!promptPath) {
    return {
      outcome: 'error',
      detail: 'prompt capture failed; re-harvest this view with --only',
      sections,
      screenshotPath,
    }
  }
  return { outcome: 'insight', sections, promptPath, screenshotPath }
}

type Waited =
  | { outcome: 'insight' }
  | { outcome: 'no-insight' | 'error'; detail: string }

// Waits for an insight sentence and, when none arrives, says which kind of
// absence this is. The card and contrast sections render nothing at all when
// generation is off or at its ceiling, and the card says so when it has too
// few peers to compare: both are genuine no-insight shapes that can be judged
// as such. A section still loading, empty, or showing a failure notice is a
// harvest failure: the view has not been judged, and the worksheet must leave
// it PENDING rather than let a timeout read as a reviewed absence.
async function awaitInsight(container: Locator): Promise<Waited> {
  try {
    await container
      .locator('[data-testid="insight-text"]')
      .first()
      .waitFor({ timeout: INSIGHT_TIMEOUT_MS })
    return { outcome: 'insight' }
  } catch {
    if ((await container.count().catch(() => 0)) === 0)
      return {
        outcome: 'no-insight',
        detail: 'insight section not rendered (generation unavailable)',
      }
    const shown =
      (await container.textContent().catch(() => null))?.trim() ||
      'empty insight section'
    if (SECTION_UNAVAILABLE.test(shown))
      return { outcome: 'no-insight', detail: shown }
    return {
      outcome: 'error',
      detail: `no insight after ${INSIGHT_TIMEOUT_MS} ms; section showed: ${shown}`,
    }
  }
}

async function readSection(
  container: Locator,
  label: string,
): Promise<Section> {
  const p = container.locator('[data-testid="insight-text"]').first()
  return {
    label,
    text: ((await p.textContent()) ?? '').trim(),
    highlight: await highlightOf(p),
  }
}

async function highlightOf(p: Locator): Promise<string | null> {
  const span = p.locator('[data-testid="insight-highlight"]')
  if ((await span.count()) === 0) return null
  return ((await span.first().textContent()) ?? '').trim() || null
}

// The transparency dialog fetches a preview render of the exact prompt, which
// spends nothing and returns the rows the model reasoned from. That is the
// "data it describes" a reviewer checks the sentence against.
async function capturePrompt(
  page: Page,
  container: Locator,
  view: ReviewView,
  outputDir: string,
): Promise<string | null> {
  const scoped = container.locator('xpath=ancestor-or-self::*[.//button][1]')
  const button = (await scoped
    .getByRole('button', { name: DISCLOSURE })
    .count())
    ? scoped.getByRole('button', { name: DISCLOSURE }).first()
    : page.getByRole('button', { name: DISCLOSURE }).first()
  try {
    await button.click()
    const pre = page.getByRole('region', { name: 'Rendered model prompt' })
    await pre.waitFor({ timeout: PROMPT_TIMEOUT_MS })
    const prompt = ((await pre.textContent()) ?? '').trim()
    const path = join(outputDir, 'prompts', `${view.id}.txt`)
    writeFileSync(path, `${prompt}\n`)
    return relative(outputDir, path)
  } catch {
    return null
  } finally {
    await page.keyboard.press('Escape').catch(() => {})
  }
}

async function screenshot(
  target: Locator,
  view: ReviewView,
  outputDir: string,
): Promise<string | null> {
  try {
    await target.scrollIntoViewIfNeeded()
    const path = join(outputDir, 'screenshots', `${view.id}.png`)
    await target.screenshot({ path })
    return relative(outputDir, path)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------

function renderWorksheet(results: HarvestedView[], baseUrl: string): string {
  const out: string[] = []
  out.push('# Insight quality pass — worksheet')
  out.push('')
  out.push(
    `Harvested ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC from ${baseUrl}. ${results.length} view(s).`,
  )
  out.push('')
  out.push(
    'For each view: open the screenshot and the live URL, read the prompt file for the rows the model saw, tick every code that applies, then set the verdict. Record every verdict, including passes: a pass rate with no denominator is not a baseline.',
  )
  out.push('')
  out.push(
    `Tick OK when nothing applies; the tally reads that as PASS. Any ticked B code makes the verdict BLOCK, any ticked N code NONBLOCK, so the Verdict line only needs editing to SKIP a view. Verdicts: ${VERDICTS.join(' | ')}. Run \`npm run insight-pass -- --tally <this file>\` when done.`,
  )
  out.push('')
  out.push('## Decision')
  out.push('')
  out.push('Go/no-go: PENDING')
  out.push('Reviewer:')
  out.push('Notes:')
  out.push('')
  for (const r of results) {
    out.push(
      `## ${r.id} · ${r.category} · ${r.surface}${r.hashId ? ` · ${r.hashId}` : ''}`,
    )
    out.push('')
    out.push(`View: ${r.fullUrl}`)
    out.push(`Why: ${r.why}`)
    out.push(
      `Screenshot: ${r.screenshotPath ?? 'none'} · Prompt: ${r.promptPath ?? 'none'}`,
    )
    out.push('')
    if (r.outcome === 'no-insight') {
      out.push(`> _No insight rendered: ${r.detail ?? 'no detail'}_`)
    } else {
      if (r.outcome === 'error') {
        out.push(
          `> _Harvest error (${r.detail ?? 'no detail'}). Not reviewable as captured; re-harvest before judging._`,
        )
        out.push('>')
      }
      for (const s of r.sections) {
        const prefix = r.sections.length > 1 ? `**${s.label}.** ` : ''
        out.push(`> ${prefix}${markHighlight(s.text, s.highlight)}`)
        if (r.sections.length > 1) out.push('>')
      }
      if (r.sections.length > 1) out.pop()
    }
    out.push('')
    out.push('Blocking:')
    for (const [code, label] of BLOCKING) out.push(`- [ ] ${code} ${label}`)
    out.push('')
    out.push('Non-blocking:')
    for (const [code, label] of NON_BLOCKING) out.push(`- [ ] ${code} ${label}`)
    out.push('')
    out.push('Or:')
    out.push(`- [ ] ${OK_CODE} ${OK_LABEL}`)
    out.push('')
    // A technical failure stays PENDING: only a page that genuinely rendered
    // no insight is a NO_INSIGHT, and an error must never read as reviewed.
    out.push(
      `Verdict: ${r.outcome === 'no-insight' ? 'NO_INSIGHT' : 'PENDING'}`,
    )
    out.push('Notes:')
    out.push('')
  }
  return `${out.join('\n')}\n`
}

// The cold read hands a non-author ten insights beside their charts and asks
// one question. No prompt, no rubric: the point is a reader who has not been
// told what to look for.
function renderColdRead(results: HarvestedView[], baseUrl: string): string {
  const out: string[] = []
  out.push('# Insight cold read')
  out.push('')
  out.push(
    `Harvested ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC from ${baseUrl}.`,
  )
  out.push('')
  out.push(
    'Please read each AI-generated sentence next to its chart (open the screenshot, or the link) and answer one question: **does this tell you something the chart did not already tell you?** Answer YES or NO, and add a note if anything reads as wrong or uncomfortable. Do not look anything up; your first reading is the data point.',
  )
  out.push('')
  for (const r of results) {
    out.push(`## ${r.id}`)
    out.push('')
    out.push(`Chart: ${r.screenshotPath ?? r.fullUrl}`)
    out.push(`Live: ${r.fullUrl}`)
    out.push('')
    if (r.outcome === 'insight') {
      for (const s of r.sections)
        out.push(
          `> ${r.sections.length > 1 ? `**${s.label}.** ` : ''}${s.text}`,
        )
    } else if (r.outcome === 'error') {
      // Nothing to read, so nothing to answer: a harvest failure must not be
      // mistaken for a view that genuinely showed no insight.
      out.push(
        `> _Harvest error (${r.detail ?? 'no detail'}). Leave unanswered; re-harvest this view with \`--only ${r.id}\` first._`,
      )
    } else {
      out.push('> _No insight rendered for this view._')
    }
    out.push('')
    out.push('Answer: PENDING')
    out.push('Notes:')
    out.push('')
  }
  return `${out.join('\n')}\n`
}

function markHighlight(text: string, highlight: string | null): string {
  if (!highlight || !text.includes(highlight)) return text
  return text.replace(highlight, `**${highlight}**`)
}

// ---------------------------------------------------------------------------

interface TalliedView {
  id: string
  category: string
  ticked: string[]
  explicit: Verdict
  effective: Verdict
  answer: string | null
}

// Reads a filled worksheet (or cold read) back and prints the numbers the
// decision rests on. Exit 1 on any blocking failure so it can gate a script.
function tally(requested: string): number {
  // npm runs from frontend/, and the default results live beside this script,
  // so a path given relative to either is accepted.
  const path = existsSync(requested) ? requested : join(here, requested)
  if (!existsSync(path)) {
    console.error(`No such file: ${requested}`)
    return 2
  }
  const lines = readFileSync(path, 'utf8').split('\n')
  const views: TalliedView[] = []
  let current: TalliedView | null = null
  for (const line of lines) {
    const heading = /^## (\S+)(?: · (\S+))?/.exec(line)
    if (heading && heading[1] !== 'Decision') {
      current = {
        id: heading[1],
        category: heading[2] ?? '-',
        ticked: [],
        explicit: 'PENDING',
        effective: 'PENDING',
        answer: null,
      }
      views.push(current)
      continue
    }
    if (!current) continue
    const box = /^- \[([xX])\] (OK|[BN]\d)\b/.exec(line)
    if (box) current.ticked.push(box[2])
    const verdict = /^Verdict:\s*(\w+)/.exec(line)
    if (verdict) current.explicit = normalizeVerdict(verdict[1])
    const answer = /^Answer:\s*(\w+)/.exec(line)
    if (answer) current.answer = answer[1].toUpperCase()
  }

  if (views.length === 0) {
    console.error(
      'No view sections found. Is this a worksheet produced by this script?',
    )
    return 2
  }

  // Cold read: one question, two answers.
  if (views.some((v) => v.answer !== null)) {
    const yes = views.filter((v) => v.answer === 'YES').length
    const no = views.filter((v) => v.answer === 'NO').length
    const pending = views.length - yes - no
    console.info(
      `Cold read: ${views.length} insight(s). Told the reader something new: ${yes}. Did not: ${no}. Unanswered: ${pending}.`,
    )
    if (pending) {
      console.info(
        'INCOMPLETE: unanswered items are not counted either way. The cold read is done when every item has an answer.',
      )
      return 1
    }
    return 0
  }

  // Ticked codes outrank the Verdict line: a B code is a BLOCK whatever was
  // written, an N code a NONBLOCK, and OK on its own a PASS. The line itself
  // only decides when nothing is ticked (SKIP, or a hand-written verdict).
  for (const v of views) {
    const codes = v.ticked.filter((c) => c !== OK_CODE)
    if (codes.some((c) => c.startsWith('B'))) v.effective = 'BLOCK'
    else if (codes.length) v.effective = 'NONBLOCK'
    else if (v.ticked.includes(OK_CODE)) v.effective = 'PASS'
    else v.effective = v.explicit
  }

  const byVerdict = countBy(views, (v) => v.effective)
  const reviewed = views.filter(
    (v) => !['PENDING', 'SKIP'].includes(v.effective),
  )
  const blocking = views.filter((v) => v.effective === 'BLOCK')
  const codeCounts = countBy(
    views.flatMap((v) => v.ticked),
    (c) => c,
  )

  console.info(
    `Views: ${views.length}. Reviewed: ${reviewed.length}. Pending: ${byVerdict.PENDING ?? 0}. Skipped: ${byVerdict.SKIP ?? 0}.`,
  )
  console.info(
    `PASS ${byVerdict.PASS ?? 0} · NONBLOCK ${byVerdict.NONBLOCK ?? 0} · BLOCK ${byVerdict.BLOCK ?? 0} · NO_INSIGHT ${byVerdict.NO_INSIGHT ?? 0}`,
  )
  if (reviewed.length) {
    const clean = views.filter((v) => v.effective === 'PASS').length
    console.info(
      `Clean pass rate: ${clean}/${reviewed.length} (${Math.round((100 * clean) / reviewed.length)}%) of reviewed views.`,
    )
  }
  console.info('')
  console.info('By code:')
  for (const [code, label] of [...BLOCKING, ...NON_BLOCKING]) {
    console.info(
      `  ${code} ${String(codeCounts[code] ?? 0).padStart(2)}  ${label}`,
    )
  }
  console.info('')
  console.info('By category:')
  for (const [category, group] of Object.entries(
    groupBy(views, (v) => v.category),
  )) {
    const c = countBy(group, (v) => v.effective)
    console.info(
      `  ${category.padEnd(11)} pass ${c.PASS ?? 0} · nonblock ${c.NONBLOCK ?? 0} · block ${c.BLOCK ?? 0} · no insight ${c.NO_INSIGHT ?? 0} · pending ${c.PENDING ?? 0}`,
    )
  }
  console.info('')
  if (blocking.length) {
    console.info(
      `NO-GO: ${blocking.length} blocking failure(s): ${blocking.map((v) => v.id).join(', ')}. One occurrence blocks launch; fix and re-harvest those views with --only.`,
    )
    return 1
  }
  if (byVerdict.PENDING) {
    console.info(
      `INCOMPLETE: ${byVerdict.PENDING} view(s) still PENDING. No decision until every view carries a verdict.`,
    )
    return 1
  }
  const nonblock = byVerdict.NONBLOCK ?? 0
  if (reviewed.length && nonblock / reviewed.length > 0.5) {
    console.info(
      `GO WITH CAVEAT: no blocking failures, but non-blocking issues on ${nonblock}/${reviewed.length} views dominate. Read the N-code counts before deciding.`,
    )
    return 0
  }
  console.info('GO: no blocking failures and every view has a verdict.')
  return 0
}

function normalizeVerdict(raw: string): Verdict {
  const upper = raw.toUpperCase() as Verdict
  return (VERDICTS as readonly string[]).includes(upper) ? upper : 'PENDING'
}

function countBy<T>(
  items: T[],
  key: (item: T) => string,
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of items) counts[key(item)] = (counts[key(item)] ?? 0) + 1
  return counts
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {}
  for (const item of items) (groups[key(item)] ??= []).push(item)
  return groups
}
