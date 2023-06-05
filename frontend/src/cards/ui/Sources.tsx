import styles from './Sources.module.scss'
import React from 'react'
import { type MapOfDatasetMetadata } from '../../data/utils/DatasetTypes'
import {
  DATA_SOURCE_PRE_FILTERS,
  LinkWithStickyParams,
} from '../../utils/urlutils'
import { DATA_CATALOG_PAGE_LINK } from '../../utils/internalRoutes'
import { DataSourceMetadataMap } from '../../data/config/MetadataMap'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { DatasetMetadataMap } from '../../data/config/DatasetMetadata'
import { Grid } from '@mui/material'
import { DownloadCardImageButton } from './DownloadCardImageButton'
import { type MetricId } from '../../data/config/MetricConfig'

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
  downloadTargetScreenshot?: () => Promise<boolean>
  isMulti?: boolean
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

  const sourcesInfo =
    Object.keys(dataSourceMap).length > 0 ? (
      <p className={styles.FootnoteText}>
        Sources:{' '}
        {Object.keys(dataSourceMap).map((dataSourceId, idx) => (
          <React.Fragment key={dataSourceId}>
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
                {Array.from(dataSourceMap[dataSourceId].updateTimes).join(', ')}
                )
              </>
            )}
            {insertPunctuation(idx, Object.keys(dataSourceMap).length)}
          </React.Fragment>
        ))}{' '}
      </p>
    ) : (
      ''
    )

  return (
    <Grid container className={styles.Footnote}>
      {/* NH note (if needed) listed first, full-width */}
      <Grid item xs={12} container alignItems={'center'}>
        {showNhFootnote && (
          <p className={styles.FootnoteTextNH}>Note. NH: Non-Hispanic. </p>
        )}
      </Grid>

      <>
        <Grid
          item
          xs={props.isMulti ? 8 : 12}
          sm={props.isMulti ? 9 : 12}
          md={props.isMulti ? 10 : 12}
          container
          alignItems={'center'}
        >
          {sourcesInfo}
        </Grid>
        {props.isMulti && (
          <Grid
            item
            xs={4}
            sm={3}
            md={2}
            container
            justifyContent={'flex-end'}
            alignItems={'flex-end'}
          >
            {props.downloadTargetScreenshot && (
              <DownloadCardImageButton
                downloadTargetScreenshot={props.downloadTargetScreenshot}
                isMulti={props.isMulti}
              />
            )}
          </Grid>
        )}
      </>
    </Grid>
  )
}

interface MetricDetailsProps {
  consumedIds: MetricId[]
}

export function MetricDetails(props: MetricDetailsProps) {
  return (
    <>
      Metrics:
      {props.consumedIds.map((metricId: MetricId) => metricId)}
    </>
  )
}
