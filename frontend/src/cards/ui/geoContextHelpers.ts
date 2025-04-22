import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'

const POP_MISSING_VALUE = 'unavailable'

export function getTotalACSPopulationPhrase(populationData: HetRow[]): string {
  const popAllCount: string = populationData?.[0]?.population?.toLocaleString()
  return `Total population: ${popAllCount ?? POP_MISSING_VALUE} (from ACS 2022)`
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
  const popAllCount: string =
    allRow?.[subPopConfig.rateDenominatorMetric?.metricId]?.toLocaleString(
      'en-US',
      { maximumFractionDigits: 0 },
    ) ?? POP_MISSING_VALUE

  const combinedSubPop = [
    dataTypeConfig.otherSubPopulationLabel,
    dataTypeConfig.ageSubPopulationLabel,
  ]
    .filter(Boolean)
    .join(', ')

  return `Total population${dataTypeConfig.otherSubPopulationLabel ? ' of' : ''}${combinedSubPop ? ' ' + combinedSubPop : ''}: ${popAllCount}${subPopulationSourceLabel ? ' (from ' + subPopulationSourceLabel + ')' : ''}`
}
