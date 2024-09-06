import { getFormatterPer100k } from '../../charts/utils'
import { LESS_THAN_POINT_1 } from '../utils/Constants'
import type {
  DataTypeConfig,
  MetricConfig,
  MetricId,
  MetricType,
} from './MetricConfigTypes'

export const populationPctTitle = 'Population share'
export const populationPctShortLabel = '% of population'

export type CardMetricType = 'rate' | 'share' | 'inequity' | 'ratio'

export function metricConfigFromDtConfig(
  cardType: CardMetricType,
  dtConfig: DataTypeConfig,
): MetricConfig {
  const cardToMetricTypesMap: Record<CardMetricType, MetricType[]> = {
    rate: ['pct_rate', 'per100k', 'index'],
    share: ['pct_share'],
    inequity: ['pct_relative_inequity'],
    ratio: ['age_adjusted_ratio'],
  }

  // Find the metric config for the given card; e.g. the Rate Map uses either pct_rate, per100k, or index
  const possibleConfigs = Object.values(dtConfig.metrics)
  const requestedConfig = possibleConfigs.find((metricConfig) =>
    cardToMetricTypesMap[cardType].includes(metricConfig.type),
  )

  // If no config is found, use the first one in the list
  return requestedConfig ?? possibleConfigs[0]
}

export function isPctType(metricType: MetricType) {
  return ['pct_share', 'pct_relative_inequity', 'pct_rate'].includes(metricType)
}

/**
 * @param metricType The type of the metric to format.
 * @param value The value to format.
 * @param omitPctSymbol Whether to omit the % symbol if the metric is a %. This
 *     can be used for example if the % symbol is part of the description.
 * @returns A formatted version of a field value based on the type specified by
 *     the field name
 */
export function formatFieldValue(
  metricType: MetricType,
  value: any,
  omitPctSymbol: boolean = false,
): string {
  if (value === null || value === undefined) {
    return ''
  }

  // if values are 100k but rounded down to 0, instead replace with "less than 1"
  if (value === 0 && metricType === 'per100k') return LESS_THAN_POINT_1

  const isRatio = metricType === 'age_adjusted_ratio'
  // only pct_share should get a decimal; others like pct_rate, 100k, index should be rounded as ints
  const formatOptions =
    metricType === 'pct_share' || metricType === 'age_adjusted_ratio'
      ? { minimumFractionDigits: 1 }
      : getFormatterPer100k(value)
  const formattedValue: string =
    typeof value === 'number'
      ? value.toLocaleString('en', formatOptions)
      : value
  const percentSuffix = isPctType(metricType) && !omitPctSymbol ? '%' : ''
  const ratioSuffix = isRatio ? '×' : ''
  return `${formattedValue}${percentSuffix}${ratioSuffix}`
}

export type MetricIdsAndConfigMapTuple = [
  MetricId[],
  Partial<Record<MetricId, MetricConfig>>,
]

// Returns an array of metric ids and a map of metric ids to their config,
// after filling in relevant sub configs like "knownBreakdownComparisonMetric"
export function getMetricIdToConfigMap(
  metricConfigs: MetricConfig[],
): MetricIdsAndConfigMapTuple {
  const metricIdToConfigMap: Partial<Record<MetricId, MetricConfig>> = {}

  metricConfigs.forEach((metricConfig) => {
    if (!metricConfig) return

    const configs: MetricConfig[] = [metricConfig]
    const possibleConfigs: (keyof MetricConfig)[] = [
      'knownBreakdownComparisonMetric',
      'populationComparisonMetric',
      'secondaryPopulationComparisonMetric',
    ]

    for (const possibleConfig of possibleConfigs) {
      if (metricConfig[possibleConfig]) {
        configs.push(metricConfig[possibleConfig] as MetricConfig)
      }
    }
    configs.forEach((metric) => {
      if (metric && !metricIdToConfigMap[metric.metricId]) {
        metricIdToConfigMap[metric.metricId] = metric
      }
    })
  })

  return [Object.keys(metricIdToConfigMap) as MetricId[], metricIdToConfigMap]
}
