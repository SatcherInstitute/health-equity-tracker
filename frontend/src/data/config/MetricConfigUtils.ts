import { DROPDOWN_TOPIC_MAP } from '../../utils/MadLibs'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type DataTypeConfig,
  type MetricConfig,
  type MetricType,
} from './MetricConfig'

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

export function isPctType(metricType: MetricType) {
  return ['pct_share', 'pct_relative_inequity', 'pct_rate'].includes(metricType)
}
