import type { MapOfDatasetMetadata } from '../../data/utils/DatasetTypes'
import { dataSourceMetadataMap } from '../../data/config/MetadataMap'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import { HET_URL } from '../../utils/internalRoutes'

export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`

export function currentYear(): number {
  return new Date().getFullYear()
}

export function insertPunctuation(idx: number, numSources: number) {
  let punctuation = ''
  // ADD COMMAS (INCL OXFORDS) FOR THREE OR MORE SOURCES
  if (numSources > 2 && idx < numSources - 1) punctuation += ', '
  // ADD " AND " BETWEEN LAST TWO SOURCES
  if (numSources > 1 && idx === numSources - 2) punctuation += ' and '
  // ADD FINAL PERIOD
  if (idx === numSources - 1) punctuation += '.'
  return punctuation
}

export interface DataSourceInfo {
  name: string
  updateTimes: Set<string>
}

export function getDatasetIdsFromResponses(
  queryResponses: MetricQueryResponse[],
): Array<DatasetId | DatasetIdWithStateFIPSCode> {
  return queryResponses.reduce(
    (accumulator: Array<DatasetId | DatasetIdWithStateFIPSCode>, response) =>
      accumulator.concat(response.consumedDatasetIds),
    [],
  )
}

export const stripCountyFips = (
  datasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode>,
): DatasetId[] => {
  const strippedData = datasetIds.map((id) => {
    // uses RegEx to check if datasetId string contains a hyphen followed by any two digits
    const regex = /-[0-9]/g
    if (regex.test(id)) {
      return id.split('-').slice(0, 2).join('-')
    } else return id
  })
  return strippedData as DatasetId[]
}

export function getDataSourceMapFromDatasetIds(
  datasetIds: string[],
  metadata: MapOfDatasetMetadata,
): Record<string, DataSourceInfo> {
  const dataSourceMap: Record<string, DataSourceInfo> = {}
  datasetIds.forEach((datasetId) => {
    const dataSourceId = metadata?.[datasetId]?.source_id

    if (dataSourceId === undefined || dataSourceId === 'error') {
      return
    }
    if (!dataSourceMap[dataSourceId]) {
      dataSourceMap[dataSourceId] = {
        name: dataSourceMetadataMap[dataSourceId]?.data_source_name || '',
        updateTimes:
          metadata[datasetId].original_data_sourced === 'unknown'
            ? new Set()
            : new Set([metadata[datasetId].original_data_sourced]),
      }
    } else if (metadata[datasetId].original_data_sourced !== 'unknown') {
      dataSourceMap[dataSourceId].updateTimes = dataSourceMap[
        dataSourceId
      ].updateTimes.add(metadata[datasetId].original_data_sourced)
    }
  })
  return dataSourceMap
}
