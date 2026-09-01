import { DATA_UNAVAILABLE } from '../../charts/mapGlobals'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'

export function getTotalACSPopulationPhrase(populationData: HetRow[]): string {
  const rawPop = populationData?.[0]?.population
  const popAllCount: string =
    rawPop != null && !isNaN(rawPop)
      ? rawPop.toLocaleString()
      : DATA_UNAVAILABLE
  return `Total population: ${popAllCount} (from ACS)`
}

export function getSubPopulationPhrase(
  subPopulationData: HetRow[],
  subPopulationSourceLabel: string,
  demographicType: DemographicType,
  dataTypeConfig: DataTypeConfig,
): string {
  const subPopConfig =
    dataTypeConfig.metrics?.pct_rate ?? dataTypeConfig.metrics?.per100k
  if (!subPopConfig?.rateDenominatorMetric) return ''
  const allRow = subPopulationData.find((row) => row[demographicType] === 'All')

  const rawPop = allRow?.[subPopConfig.rateDenominatorMetric?.metricId]
  const popAllCount: string =
    rawPop != null && !isNaN(rawPop)
      ? rawPop.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : DATA_UNAVAILABLE

  const combinedSubPop = [
    dataTypeConfig.otherSubPopulationLabel,
    dataTypeConfig.ageSubPopulationLabel,
  ]
    .filter(Boolean)
    .join(', ')

  return `Total population${dataTypeConfig.otherSubPopulationLabel ? ' of' : ''}${combinedSubPop ? ' ' + combinedSubPop : ''}: ${popAllCount}${subPopulationSourceLabel ? ' (from ' + subPopulationSourceLabel + ')' : ''}`
}
