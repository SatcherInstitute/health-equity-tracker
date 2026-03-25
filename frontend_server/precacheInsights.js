/**
 * precacheInsights.js — Pre-warms the AI insight GCS cache at deploy time.
 *
 * Iterates over all known topics × demographic types and calls /fetch-ai-insight
 * for the national US view (fips "00"). The server skips calls where the entry
 * is already cached, so re-running this is idempotent.
 *
 * Usage:
 *   node precacheInsights.js
 *
 * Environment variables:
 *   PRECACHE_ENDPOINT   URL of the /fetch-ai-insight endpoint
 *                       (default: http://localhost:8080/fetch-ai-insight)
 *   PRECACHE_DELAY_MS   Milliseconds to wait between requests to avoid rate
 *                       limiting (default: 500)
 */

const ENDPOINT =
  process.env['PRECACHE_ENDPOINT'] ??
  'http://localhost:8080/fetch-ai-insight'

const DELAY_MS = Number(process.env['PRECACHE_DELAY_MS'] ?? '500')

// ── Topic list ────────────────────────────────────────────────────────────────
// Mirrors METRIC_CONFIG from frontend/src/data/config/MetricConfig.ts.
// Update this list when new data types are added to the app.

const TOPICS = [
  // HIV
  { dataTypeId: 'hiv_care', fullDisplayName: 'Linkage to HIV care' },
  { dataTypeId: 'hiv_prevalence', fullDisplayName: 'HIV prevalence' },
  { dataTypeId: 'hiv_diagnoses', fullDisplayName: 'New HIV diagnoses' },
  { dataTypeId: 'hiv_deaths', fullDisplayName: 'HIV deaths' },
  { dataTypeId: 'hiv_stigma', fullDisplayName: 'HIV stigma' },
  {
    dataTypeId: 'hiv_prevalence_black_women',
    fullDisplayName: 'HIV prevalence for Black women',
  },
  {
    dataTypeId: 'hiv_diagnoses_black_women',
    fullDisplayName: 'New HIV diagnoses for Black women',
  },
  {
    dataTypeId: 'hiv_deaths_black_women',
    fullDisplayName: 'HIV deaths for Black women',
  },
  { dataTypeId: 'hiv_prep', fullDisplayName: 'PrEP coverage' },
  // COVID-19
  { dataTypeId: 'covid_cases', fullDisplayName: 'COVID-19 cases' },
  { dataTypeId: 'covid_deaths', fullDisplayName: 'COVID-19 deaths' },
  {
    dataTypeId: 'covid_hospitalizations',
    fullDisplayName: 'COVID-19 hospitalizations',
  },
  {
    dataTypeId: 'covid_vaccinations',
    fullDisplayName: 'COVID-19 vaccinations',
  },
  // Behavioral Health
  { dataTypeId: 'depression', fullDisplayName: 'Depression cases' },
  {
    dataTypeId: 'excessive_drinking',
    fullDisplayName: 'Excessive drinking cases',
  },
  {
    dataTypeId: 'non_medical_drug_use',
    fullDisplayName: 'Opioid and other non-medical drug use',
  },
  {
    dataTypeId: 'frequent_mental_distress',
    fullDisplayName: 'Frequent mental distress cases',
  },
  { dataTypeId: 'suicide', fullDisplayName: 'Suicides' },
  // Community Safety
  { dataTypeId: 'gun_violence_homicide', fullDisplayName: 'Gun homicides' },
  { dataTypeId: 'gun_violence_suicide', fullDisplayName: 'Gun suicides' },
  { dataTypeId: 'gun_deaths', fullDisplayName: 'Gun deaths' },
  { dataTypeId: 'gun_deaths_youth', fullDisplayName: 'Gun deaths (children)' },
  {
    dataTypeId: 'gun_deaths_young_adults',
    fullDisplayName: 'Gun deaths (young adults)',
  },
  {
    dataTypeId: 'gun_deaths_black_men',
    fullDisplayName: 'Gun homicides (Black Men)',
  },
  // Chronic Disease
  { dataTypeId: 'asthma', fullDisplayName: 'Asthma cases' },
  {
    dataTypeId: 'cardiovascular_diseases',
    fullDisplayName: 'Cases of cardiovascular diseases',
  },
  {
    dataTypeId: 'chronic_kidney_disease',
    fullDisplayName: 'Cases of chronic kidney disease',
  },
  { dataTypeId: 'diabetes', fullDisplayName: 'Diabetes' },
  { dataTypeId: 'copd', fullDisplayName: 'COPD' },
  // SDOH
  { dataTypeId: 'health_insurance', fullDisplayName: 'Uninsured people' },
  {
    dataTypeId: 'poverty',
    fullDisplayName: 'People below the poverty line',
  },
  {
    dataTypeId: 'avoided_care',
    fullDisplayName: 'Care avoidance due to cost',
  },
  {
    dataTypeId: 'preventable_hospitalizations',
    fullDisplayName: 'Preventable hospitalizations',
  },
  // PDOH
  { dataTypeId: 'voter_participation', fullDisplayName: 'Voter participation' },
  {
    dataTypeId: 'women_in_us_congress',
    fullDisplayName: 'Women in US Congress',
  },
  {
    dataTypeId: 'women_in_state_legislature',
    fullDisplayName: 'Women in state legislatures',
  },
  { dataTypeId: 'prison', fullDisplayName: 'People in prison' },
  { dataTypeId: 'jail', fullDisplayName: 'People in jail' },
  // Medicare / Phrma
  {
    dataTypeId: 'bb_ami_adherence',
    fullDisplayName:
      'Population Receiving Persistent Beta Blocker Treatment After a Heart Attack',
  },
  {
    dataTypeId: 'statins_adherence',
    fullDisplayName: 'Adherence to statins',
  },
  {
    dataTypeId: 'beta_blockers_adherence',
    fullDisplayName: 'Adherence to beta blockers',
  },
  {
    dataTypeId: 'ras_antagonists_adherence',
    fullDisplayName: 'Adherence to RASA',
  },
  {
    dataTypeId: 'ccb_adherence',
    fullDisplayName: 'Adherence to calcium channel blockers',
  },
  {
    dataTypeId: 'doac_adherence',
    fullDisplayName: 'Adherence to direct oral anticoagulants',
  },
  {
    dataTypeId: 'medicare_ami',
    fullDisplayName: 'Acute Myocardial Infarctions (Heart Attacks)',
  },
  {
    dataTypeId: 'arv_adherence',
    fullDisplayName: 'Adherence to antiretroviral medications',
  },
  { dataTypeId: 'medicare_hiv', fullDisplayName: 'New HIV diagnoses' },
  {
    dataTypeId: 'anti_psychotics_adherence',
    fullDisplayName: 'Adherence to anti-psychotics',
  },
  {
    dataTypeId: 'medicare_schizophrenia',
    fullDisplayName: 'Cases of Schizophrenia',
  },
  // Cancer Screening
  {
    dataTypeId: 'breast_cancer_screening',
    fullDisplayName: 'Breast cancer screening',
  },
  {
    dataTypeId: 'prostate_cancer_screening',
    fullDisplayName: 'Prostate cancer screening',
  },
  {
    dataTypeId: 'colorectal_cancer_screening',
    fullDisplayName: 'Colorectal cancer screening',
  },
  {
    dataTypeId: 'cervical_cancer_screening',
    fullDisplayName: 'Cervical cancer screening',
  },
  {
    dataTypeId: 'lung_cancer_screening',
    fullDisplayName: 'Lung cancer screening',
  },
  // Cancer Incidence
  {
    dataTypeId: 'breast_cancer_incidence',
    fullDisplayName: 'Breast cancer cases',
  },
  {
    dataTypeId: 'cervical_cancer_incidence',
    fullDisplayName: 'Cervical cancer cases',
  },
  {
    dataTypeId: 'colorectal_cancer_incidence',
    fullDisplayName: 'Colorectal cancer cases',
  },
  {
    dataTypeId: 'lung_cancer_incidence',
    fullDisplayName: 'Lung cancer cases',
  },
  {
    dataTypeId: 'prostate_cancer_incidence',
    fullDisplayName: 'Prostate cancer cases',
  },
  // Maternal Health
  { dataTypeId: 'maternal_mortality', fullDisplayName: 'Maternal mortality' },
]

// Demographic types to pre-cache.  Matches DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE
// in frontend/src/data/query/Breakdowns.ts.
const DEMOGRAPHICS = [
  { id: 'race_and_ethnicity', label: 'race/ethnicity' },
  { id: 'age', label: 'age' },
  { id: 'sex', label: 'sex' },
]

// National US FIPS entry (fips code "00" = United States overall)
const NATIONAL = { code: '00', sentenceDisplayName: 'the United States' }

// ── Prompt builder ────────────────────────────────────────────────────────────
// Must stay in sync with generateReportInsightPrompt in
// frontend/src/utils/generateReportInsight.ts.

function buildPrompt(topic, location, demographicLabel) {
  return `You are a public health analyst reviewing a report about "${topic}" in ${location}, broken down by ${demographicLabel}.

The page contains multiple charts: a rate map, rates over time, a rate bar chart, an unknowns map, inequities over time, and a population vs distribution chart.

WRITING RULES — follow these strictly:
- Write at an 8th-grade reading level. Use short words and simple sentences.
- Avoid jargon. If you must use a technical term, explain it immediately.
- Each section: 1-2 sentences maximum, 35 words or fewer.
- keyFindings: 1 sentence, 25 words or fewer. Lead with the single most striking fact.

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation outside the JSON. Use this exact structure:

{
  "keyFindings": "1 sentence (max 25 words): the single most striking disparity, leading with a specific number or rate.",
  "locationComparison": "1-2 sentences (max 35 words): which places have the biggest gaps and why that might be.",
  "demographicInsights": "1-2 sentences (max 35 words): which group is most affected and how large the gap is compared to others.",
  "whatThisMeans": "1-2 sentences (max 35 words): what this means for real people in these communities, in plain everyday language."
}`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function precacheOne(topic, demographic, retries = 3) {
  const { dataTypeId, fullDisplayName } = topic
  const { id: demographicType, label: demographicLabel } = demographic
  const cacheKey = `report-${dataTypeId}-${NATIONAL.code}-${demographicType}`
  const prompt = buildPrompt(fullDisplayName, NATIONAL.sentenceDisplayName, demographicLabel)

  for (let attempt = 1; attempt <= retries; attempt++) {
    let res
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cacheKey }),
      })
    } catch (err) {
      console.error(`  [network error] ${cacheKey}:`, err.message)
      if (attempt < retries) await sleep(DELAY_MS * attempt * 2)
      continue
    }

    if (res.status === 429) {
      const waitMs = DELAY_MS * attempt * 4
      console.warn(`  [rate limited] ${cacheKey} — waiting ${waitMs}ms before retry ${attempt}/${retries}`)
      await sleep(waitMs)
      continue
    }

    if (!res.ok) {
      console.error(`  [http ${res.status}] ${cacheKey}: ${res.statusText}`)
      return false
    }

    console.log(`  [ok] ${cacheKey}`)
    return true
  }

  console.error(`  [failed after ${retries} retries] ${cacheKey}`)
  return false
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const jobs = []
  for (const topic of TOPICS) {
    for (const demographic of DEMOGRAPHICS) {
      jobs.push({ topic, demographic })
    }
  }

  console.log(`Pre-caching ${jobs.length} insight entries via ${ENDPOINT}`)
  console.log(`Delay between requests: ${DELAY_MS}ms\n`)

  let succeeded = 0
  let failed = 0

  for (let i = 0; i < jobs.length; i++) {
    const { topic, demographic } = jobs[i]
    process.stdout.write(`[${i + 1}/${jobs.length}] ${topic.dataTypeId} × ${demographic.id} `)
    const ok = await precacheOne(topic, demographic)
    if (ok) succeeded++
    else failed++
    if (i < jobs.length - 1) await sleep(DELAY_MS)
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
