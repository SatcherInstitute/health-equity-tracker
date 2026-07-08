import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import { ALL } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'

// Builds a deterministic screen-reader-only summary of the population vs.
// distribution chart, e.g. "Black has the largest gap: 18% share of cases
// vs. 12% share of population. White has the most proportionate representation."
export function getStackedBarA11ySummary(
  data: HetRow[],
  lightMetric: MetricConfig,
  darkMetric: MetricConfig,
  demographicType: DemographicType,
): string {
  const rows = data.filter(
    (row) =>
      row[demographicType] !== ALL &&
      typeof row[lightMetric.metricId] === 'number' &&
      !Number.isNaN(row[lightMetric.metricId]) &&
      typeof row[darkMetric.metricId] === 'number' &&
      !Number.isNaN(row[darkMetric.metricId]),
  )
  if (rows.length === 0) return ''

  const gapOf = (row: HetRow) =>
    Math.abs(row[darkMetric.metricId] - row[lightMetric.metricId])

  const largestGap = rows.reduce((a, b) => (gapOf(b) > gapOf(a) ? b : a))
  const smallestGap = rows.reduce((a, b) => (gapOf(b) < gapOf(a) ? b : a))

  const largestGapSentence = `${largestGap[demographicType]} has the largest gap: ${
    largestGap[darkMetric.metricId]
  } ${darkMetric.shortLabel} vs. ${largestGap[lightMetric.metricId]} ${
    lightMetric.shortLabel
  }.`

  if (largestGap === smallestGap) return largestGapSentence

  return `${largestGapSentence} ${smallestGap[demographicType]} has the most proportionate representation.`
}
