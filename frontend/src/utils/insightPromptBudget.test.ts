import type { MetricConfig } from '../data/config/MetricConfigTypes'
import type { HetRow } from '../data/utils/DatasetTypes'
import { buildContrastPrompt } from './generateContrastInsight'
import { buildReportInsightPrompt } from './generateReportInsight'
import { buildPrompt, formatDataRows } from './generateVisualizationInsight'
import {
  byteLength,
  INSIGHT_DATA_BUDGETS,
  INSIGHT_PROMPT_MAX_BYTES,
  trimLinesToBudget,
  trimSectionToBudget,
} from './insightPromptBudget'

const DEMO = 'race_and_ethnicity'

const metricConfig = {
  metricId: 'rate',
  shortLabel: 'per 100k',
} as unknown as MetricConfig

// A breakdown wide enough to outgrow every budget tier: 400 places x 6 groups.
function oversizedMapRows(): HetRow[] {
  const groups = [
    'All',
    'Black (NH)',
    'White (NH)',
    'Hispanic',
    'Asian (NH)',
    'AI/AN (NH)',
  ]
  return Array.from({ length: 400 }, (_, place) =>
    groups.map((group) => ({
      fips_name: `Some Very Long County Name Number ${place}`,
      [DEMO]: group,
      rate: 100 + place,
    })),
  ).flat()
}

function oversizedSection(): string {
  return Array.from(
    { length: 2000 },
    (_, i) => `- Group number ${i} with a long label: ${i} per 100k`,
  ).join('\n')
}

describe('trimLinesToBudget', () => {
  test('returns every line when the whole list fits', () => {
    expect(trimLinesToBudget(['- a: 1', '- b: 2'], 1024)).toEqual(
      '- a: 1\n- b: 2',
    )
  })

  test('drops whole lines rather than cutting one mid-value', () => {
    const lines = ['- aaaa: 1', '- bbbb: 2', '- cccc: 3']
    // Room for the first two lines and their separator, not the third.
    const result = trimLinesToBudget(lines, 19)
    expect(result).toEqual('- aaaa: 1\n- bbbb: 2')
    expect(byteLength(result)).toBeLessThanOrEqual(19)
  })

  test('counts bytes rather than characters for multi-byte labels', () => {
    // Each "ñ" is two bytes, so this line costs more than its length suggests.
    // cSpell:ignore ñññññ
    const line = '- ñññññ: 1'
    expect(byteLength(line)).toBeGreaterThan(line.length)
    expect(trimLinesToBudget([line], line.length)).toEqual('')
  })
})

describe('trimSectionToBudget', () => {
  test('leaves an in-budget section byte-identical', () => {
    const section = '- Alabama (All): 9 per 100k\n- Alaska (All): 5 per 100k'
    expect(trimSectionToBudget(section, 1024)).toEqual(section)
  })

  test('caps an over-budget section', () => {
    const result = trimSectionToBudget(oversizedSection(), 2048)
    expect(byteLength(result)).toBeLessThanOrEqual(2048)
    expect(result.split('\n').at(-1)).toMatch(/per 100k$/)
  })
})

describe('formatDataRows budget tiers', () => {
  test('a map section is capped at the single-card tier by default', () => {
    const section = formatDataRows(
      oversizedMapRows(),
      'rate-map',
      DEMO,
      metricConfig,
    )
    expect(byteLength(section)).toBeLessThanOrEqual(INSIGHT_DATA_BUDGETS.card)
    expect(section.split('\n').at(-1)).toMatch(/per 100k$/)
  })

  test('a data-table section is capped too', () => {
    const section = formatDataRows(
      oversizedMapRows(),
      'data-table',
      DEMO,
      metricConfig,
    )
    expect(byteLength(section)).toBeLessThanOrEqual(INSIGHT_DATA_BUDGETS.card)
  })

  test('a time-series section honors the budget it is given', () => {
    const rows: HetRow[] = Array.from({ length: 4000 }, (_, i) => ({
      [DEMO]: `Group ${i % 8}`,
      time_period: String(1980 + Math.floor(i / 8)),
      rate: i,
    }))
    const section = formatDataRows(
      rows,
      'rates-over-time',
      DEMO,
      metricConfig,
      undefined,
      undefined,
      INSIGHT_DATA_BUDGETS.contrast,
    )
    expect(byteLength(section)).toBeLessThanOrEqual(
      INSIGHT_DATA_BUDGETS.contrast,
    )
  })

  test('the contrast tier is tighter than the single-card tier', () => {
    const rows = oversizedMapRows()
    const card = formatDataRows(rows, 'rate-map', DEMO, metricConfig)
    const contrast = formatDataRows(
      rows,
      'rate-map',
      DEMO,
      metricConfig,
      undefined,
      undefined,
      INSIGHT_DATA_BUDGETS.contrast,
    )
    expect(byteLength(contrast)).toBeLessThan(byteLength(card))
  })
})

describe('assembled prompts stay under the server ceiling', () => {
  test('single-card prompt', () => {
    const section = formatDataRows(
      oversizedMapRows(),
      'rate-map',
      DEMO,
      metricConfig,
    )
    const prompt = buildPrompt(
      'rate-map',
      'HIV diagnoses',
      'Georgia',
      'race and ethnicity',
      section,
      'Black (NH)',
    )
    expect(byteLength(prompt)).toBeLessThanOrEqual(INSIGHT_PROMPT_MAX_BYTES)
  })

  test('compare-mode contrast prompt, both sides oversized', () => {
    const rows = oversizedMapRows()
    const side = () =>
      formatDataRows(
        rows,
        'rate-map',
        DEMO,
        metricConfig,
        undefined,
        undefined,
        INSIGHT_DATA_BUDGETS.contrast,
      )
    const prompt = buildContrastPrompt(
      'HIV diagnoses',
      'Diabetes',
      'Georgia',
      'Alabama',
      'race and ethnicity',
      side(),
      side(),
    )
    expect(byteLength(prompt)).toBeLessThanOrEqual(INSIGHT_PROMPT_MAX_BYTES)
  })

  test('report-wide prompt with all five sections oversized', () => {
    const section = oversizedSection()
    const prompt = buildReportInsightPrompt(
      'HIV diagnoses',
      'Georgia',
      'race and ethnicity',
      {
        demographicSection: section,
        geographicSection: section,
        temporalSection: section,
        ageAdjustedSection: section,
        unknownSection: section,
      },
    )
    expect(byteLength(prompt)).toBeLessThanOrEqual(INSIGHT_PROMPT_MAX_BYTES)
  })

  test('report-wide prompt with no sections at all', () => {
    const prompt = buildReportInsightPrompt(
      'HIV diagnoses',
      'Georgia',
      'race and ethnicity',
      {
        demographicSection: '',
        geographicSection: '',
        temporalSection: '',
        ageAdjustedSection: '',
        unknownSection: '',
      },
    )
    expect(byteLength(prompt)).toBeLessThanOrEqual(INSIGHT_PROMPT_MAX_BYTES)
  })
})
