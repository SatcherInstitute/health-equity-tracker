import {
  type DropdownVarId,
  METRIC_CONFIG,
  type VariableConfig,
} from './MetricConfig'

export function getDataTypesMap(dropdownVarId: DropdownVarId) {
  const dataTypesMap: Record<string, VariableConfig> = {}
  METRIC_CONFIG[dropdownVarId].forEach((variableConfig: VariableConfig) => {
    dataTypesMap[variableConfig.variableDisplayName] = variableConfig
  })
  return dataTypesMap
}
