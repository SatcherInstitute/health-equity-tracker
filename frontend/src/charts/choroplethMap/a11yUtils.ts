import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { Fips } from '../../data/utils/Fips'
import { formatMetricValue } from './mapHelpers'
import type { DataPoint } from './types'

// Builds a deterministic screen-reader-only summary of the choropleth map,
// e.g. "Mississippi has the highest value at 720 per 100k. Utah has the
// lowest at 45 per 100k. Data available for 48 of 52 states/territories."
export function getMapA11ySummary(
  data: DataPoint[],
  metricConfig: MetricConfig,
  fips: Fips,
): string {
  const metricId = metricConfig.metricId
  const validRows = data.filter((row) => typeof row[metricId] === 'number')
  if (validRows.length === 0) return 'No data available for this map.'

  const highest = validRows.reduce((a, b) =>
    b[metricId] > a[metricId] ? b : a,
  )
  const lowest = validRows.reduce((a, b) => (b[metricId] < a[metricId] ? b : a))

  const childType = fips.getPluralChildFipsTypeDisplayName()
  const coverageSentence = childType
    ? ` Data available for ${validRows.length} ${childType}.`
    : ''

  if (highest === lowest) {
    return `${highest.fips_name} has a value of ${formatMetricValue(
      highest[metricId],
      metricConfig,
    )}.${coverageSentence}`
  }

  return `${highest.fips_name} has the highest value at ${formatMetricValue(
    highest[metricId],
    metricConfig,
  )}. ${lowest.fips_name} has the lowest at ${formatMetricValue(
    lowest[metricId],
    metricConfig,
  )}.${coverageSentence}`
}
