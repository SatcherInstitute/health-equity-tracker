import { getFormatterPer100k } from '../../charts/utils'
import type { GeographicBreakdown } from '../query/Breakdowns'
import type { DropdownVarId } from './DropDownIds'
import { METRIC_CONFIG } from './MetricConfig'
import type {
  CardMetricType,
  DataTypeConfig,
  MetricConfig,
  MetricId,
  MetricType,
} from './MetricConfigTypes'

export function metricConfigFromDtConfig(
  cardType: CardMetricType,
  dtConfig: DataTypeConfig,
): MetricConfig | undefined {
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
  return requestedConfig
}

export function isPctType(metricType: MetricType) {
  return ['pct_share', 'pct_relative_inequity', 'pct_rate'].includes(metricType)
}

export function isRateType(metricType: MetricType) {
  return ['pct_rate', 'per100k', 'index'].includes(metricType)
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

function addConfigToMap(
  map: Record<MetricId, MetricConfig>,
  metricConfig: MetricConfig | undefined,
) {
  if (metricConfig) {
    map[metricConfig.metricId] = metricConfig
  }
  return map
}

export function getMetricIdToConfigMap(
  metricConfigs: MetricConfig[],
): Record<MetricId, MetricConfig> {
  return metricConfigs.reduce(
    (metricMap, config) => {
      // We prefer known breakdown metric if available.
      addConfigToMap(metricMap, config.knownBreakdownComparisonMetric ?? config)
      addConfigToMap(metricMap, config.populationComparisonMetric)
      addConfigToMap(metricMap, config.secondaryPopulationComparisonMetric)

      return metricMap
    },
    {} as Record<MetricId, MetricConfig>,
  )
}

export function getMetricConfigsForIds(
  ids: DropdownVarId[],
): { id: DropdownVarId; configs: DataTypeConfig[] }[] {
  return ids.map((id) => ({
    id,
    configs: METRIC_CONFIG[id],
  }))
}

export function formatSubPopString({
  ageSubPopulationLabel,
  otherSubPopulationLabel,
}: {
  ageSubPopulationLabel?: string
  otherSubPopulationLabel?: string
}) {
  return otherSubPopulationLabel && ageSubPopulationLabel
    ? `${otherSubPopulationLabel}, ${ageSubPopulationLabel}`
    : otherSubPopulationLabel || ageSubPopulationLabel || ''
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<T>,
): T {
  const result = { ...base }
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const src = overrides[key]
    const tgt = result[key]
    result[key] = (
      isPlainObject(src) && isPlainObject(tgt)
        ? deepMerge(tgt, src as Partial<typeof tgt>)
        : src
    ) as T[keyof T]
  }
  return result
}

export function applyGeoOverrides(
  config: DataTypeConfig,
  geography: GeographicBreakdown,
): DataTypeConfig {
  const overrides = config.geoOverrides?.[geography]
  if (!overrides) return config
  return deepMerge(
    config as unknown as Record<string, unknown>,
    overrides as unknown as Partial<Record<string, unknown>>,
  ) as unknown as DataTypeConfig
}
