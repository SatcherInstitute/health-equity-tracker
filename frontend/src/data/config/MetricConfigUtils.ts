import { type MetricQuery } from '../query/MetricQuery'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type VariableConfig,
  type MetricId,
} from './MetricConfig'

export function getDataTypesMap(dropdownVarId: DropdownVarId) {
  const dataTypesMap: Record<string, VariableConfig> = {}
  METRIC_CONFIG[dropdownVarId]?.forEach((variableConfig: VariableConfig) => {
    dataTypesMap[variableConfig.dataTypeName] = variableConfig
  })
  return dataTypesMap
}

export function getConsumedIds(queries: MetricQuery[]): MetricId[] {
  return Array.from(new Set(queries.map((query) => query.metricIds).flat()))
}
