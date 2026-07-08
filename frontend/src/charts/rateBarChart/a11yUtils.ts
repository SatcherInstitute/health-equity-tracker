import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import { ALL } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { formatValue } from '../sharedBarChartPieces/helpers'

// Builds a deterministic screen-reader-only summary of the rate bar chart,
// e.g. "Hispanic has the highest rate at 450 per 100k (3.1x the All group).
// White has the lowest rate at 89 per 100k."
export function getRateBarA11ySummary(
  data: HetRow[],
  metricConfig: MetricConfig,
  demographicType: DemographicType,
): string {
  const metricId = metricConfig.metricId
  const validRows = data.filter(
    (row) => typeof row[metricId] === 'number' && !Number.isNaN(row[metricId]),
  )
  const comparisonRows = validRows.filter((row) => row[demographicType] !== ALL)
  if (comparisonRows.length === 0) return ''

  const highest = comparisonRows.reduce((a, b) =>
    b[metricId] > a[metricId] ? b : a,
  )
  const lowest = comparisonRows.reduce((a, b) =>
    b[metricId] < a[metricId] ? b : a,
  )

  const allValue = validRows.find((row) => row[demographicType] === ALL)?.[
    metricId
  ]
  const ratioToAll =
    typeof allValue === 'number' && allValue > 0
      ? ` (${(highest[metricId] / allValue).toFixed(1)}x the All group)`
      : ''

  const highestSentence = `${highest[demographicType]} has the highest rate at ${formatValue(
    highest[metricId],
    metricConfig,
    true,
  )}${ratioToAll}.`

  if (highest === lowest) return highestSentence

  return `${highestSentence} ${lowest[demographicType]} has the lowest rate at ${formatValue(
    lowest[metricId],
    metricConfig,
    true,
  )}.`
}
