import React, { Fragment } from 'react'
import { type MapOfDatasetMetadata } from '../../data/utils/DatasetTypes'
import {
  DATA_SOURCE_PRE_FILTERS,
  LinkWithStickyParams,
} from '../../utils/urlutils'
import { DATA_CATALOG_PAGE_LINK } from '../../utils/internalRoutes'
import { DataSourceMetadataMap } from '../../data/config/MetadataMap'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { DatasetMetadataMap } from '../../data/config/DatasetMetadata'

function insertPunctuation(idx: number, numSources: number) {
  let punctuation = ''
  // ADD COMMAS (INCL OXFORDS) FOR THREE OR MORE SOURCES
  if (numSources > 2 && idx < numSources - 1) punctuation += ', '
  // ADD " AND " BETWEEN LAST TWO SOURCES
  if (numSources > 1 && idx === numSources - 2) punctuation += ' and '
  // ADD FINAL PERIOD
  if (idx === numSources - 1) punctuation += '.'
  return punctuation
}

interface DataSourceInfo {
  name: string
  updateTimes: Set<string>
}

export function getDatasetIdsFromResponses(
  queryResponses: MetricQueryResponse[]
): string[] {
  return queryResponses.reduce(
    (accumulator: string[], response) =>
      accumulator.concat(response.consumedDatasetIds),
    []
  )
}

export const stripCountyFips = (datasetIds: string[]) => {
  const strippedData = datasetIds.map((id) => {
    // uses RegEx to check if datasetId string contains a hyphen followed by any two digits
    const regex = /-[0-9]/g
    if (regex.test(id)) {
      return id.split('-').slice(0, 2).join('-')
    } else return id
  })
  return strippedData
}

export function getDataSourceMapFromDatasetIds(
  datasetIds: string[],
  metadata: MapOfDatasetMetadata
): Record<string, DataSourceInfo> {
  const dataSourceMap: Record<string, DataSourceInfo> = {}
  datasetIds.forEach((datasetId) => {
    const dataSourceId = metadata?.[datasetId]?.source_id

    if (dataSourceId === undefined) {
      return
    }
    if (!dataSourceMap[dataSourceId]) {
      dataSourceMap[dataSourceId] = {
        name: DataSourceMetadataMap[dataSourceId]?.data_source_name || '',
        updateTimes:
          metadata[datasetId].update_time === 'unknown'
            ? new Set()
            : new Set([metadata[datasetId].update_time]),
      }
    } else if (metadata[datasetId].update_time !== 'unknown') {
      dataSourceMap[dataSourceId].updateTimes = dataSourceMap[
        dataSourceId
      ].updateTimes.add(metadata[datasetId].update_time)
    }
  })
  return dataSourceMap
}

interface SourcesProps {
  queryResponses: MetricQueryResponse[]
  metadata: MapOfDatasetMetadata
  isAgeAdjustedTable?: boolean
  hideNH?: boolean
}

export function Sources(props: SourcesProps) {
  // If all data is missing, no need to show sources.
  if (props.queryResponses.every((resp) => resp.dataIsMissing())) {
    return <></>
  }

  const unstrippedDatasetIds = getDatasetIdsFromResponses(props.queryResponses)
  let datasetIds = stripCountyFips(unstrippedDatasetIds)

  // for Age Adj only, swap ACS source(s) for Census Pop Estimate
  if (props.isAgeAdjustedTable) {
    datasetIds = datasetIds.filter((datasetId) => !datasetId.includes('acs'))
    datasetIds.push('census_pop_estimates-race_and_ethnicity')
  }

  const dataSourceMap = getDataSourceMapFromDatasetIds(
    datasetIds,
    props.metadata
  )

  const showNhFootnote =
    !props.hideNH &&
    datasetIds.some((set) => DatasetMetadataMap[set]?.contains_nh)

  const showOtherNhFootnote =
    !props.hideNH &&
    datasetIds.some((set) => DatasetMetadataMap[set]?.contains_other_nh)

  return (
    <>
      {Object.keys(dataSourceMap).length > 0 && <>Sources: </>}
      {Object.keys(dataSourceMap).map((dataSourceId, idx) => (
        <Fragment key={dataSourceId}>
          <LinkWithStickyParams
            target="_blank"
            to={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${dataSourceId}`}
          >
            {dataSourceMap[dataSourceId].name}
          </LinkWithStickyParams>{' '}
          {dataSourceMap[dataSourceId].updateTimes.size === 0 ? (
            <>(last update unknown) </>
          ) : (
            <>
              (updated{' '}
              {Array.from(dataSourceMap[dataSourceId].updateTimes).join(', ')})
            </>
          )}
          {insertPunctuation(idx, Object.keys(dataSourceMap).length)}
        </Fragment>
      ))}
      {showNhFootnote && <p>(NH) Non-Hispanic. </p>}
      {showOtherNhFootnote && (
        <p>
          Unrepresented race (NH): Individuals who do not identify as part of
          the Black, White, or Hispanic ethnic or racial groups.
        </p>
      )}
    </>
  )
}
