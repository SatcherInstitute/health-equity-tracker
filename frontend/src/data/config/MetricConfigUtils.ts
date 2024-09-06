import type { DataTypeConfig, MetricConfig, MetricType } from './MetricConfig'

export const populationPctTitle = 'Population share'
export const populationPctShortLabel = '% of population'

export type CardMetricType = 'rate' | 'share' | 'inequity' | 'ratio'

export function metricConfigFromDtConfig(
  cardType: CardMetricType,
  dtConfig: DataTypeConfig | null,
): MetricConfig | undefined {
  if (!dtConfig) return undefined

  const cardToMetricTypesMap: Record<CardMetricType, MetricType[]> = {
    rate: ['pct_rate', 'per100k', 'index'],
    share: ['pct_share'],
    inequity: ['pct_relative_inequity'],
    ratio: ['age_adjusted_ratio'],
  }

  // Find the metric config for the given card; e.g. the Rate Map uses either pct_rate, per100k, or index
  return Object.values(dtConfig.metrics).find((metricConfig) =>
    cardToMetricTypesMap[cardType].includes(metricConfig.type),
  )
}
