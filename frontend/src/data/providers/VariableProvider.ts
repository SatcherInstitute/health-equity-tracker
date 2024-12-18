import type { IDataFrame } from 'data-forge'
import type { DatasetId } from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { Breakdowns, TimeView } from '../query/Breakdowns'
import {
  type MetricQuery,
  type MetricQueryResponse,
  createMissingDataResponse,
} from '../query/MetricQuery'
import { DatasetOrganizer } from '../sorting/DatasetOrganizer'
import { TIME_PERIOD } from '../utils/Constants'

abstract class VariableProvider {
  readonly providerId: ProviderId
  readonly providesMetrics: MetricId[]

  constructor(providerId: ProviderId, providesMetrics: MetricId[]) {
    this.providerId = providerId
    this.providesMetrics = providesMetrics
  }

  async getData(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
    if (!this.allowsBreakdowns(metricQuery.breakdowns, metricQuery.metricIds)) {
      return createMissingDataResponse(
        'Breakdowns not supported for provider ' +
          this.providerId +
          ': ' +
          metricQuery.breakdowns.getUniqueKey(),
      )
    }

    // TODO: check that the metrics are all provided by this provider once we don't have providers relying on other providers
    const resp = await this.getDataInternal(metricQuery)
    new DatasetOrganizer(resp.data, metricQuery.breakdowns).organize()
    return resp
  }

  filterByGeo(df: IDataFrame, breakdowns: Breakdowns): IDataFrame {
    const fipsColumn: string =
      breakdowns.geography === 'county' ? 'county_fips' : 'state_fips'

    if (breakdowns.filterFips !== undefined) {
      const fips = breakdowns.filterFips
      if (fips.isStateOrTerritory() && breakdowns.geography === 'county') {
        return df.where((row) => fips.isParentOf(row.county_fips)).resetIndex()
      } else {
        return df.where((row) => row[fipsColumn] === fips.code).resetIndex()
      }
    }
    return df
  }

  renameGeoColumns(df: IDataFrame, breakdowns: Breakdowns): IDataFrame {
    let newDataframe = df
    const [fipsColumn, geoNameColumn] =
      breakdowns.geography === 'county'
        ? ['county_fips', 'county_name']
        : ['state_fips', 'state_name']

    if (breakdowns.geography === 'county') {
      newDataframe = newDataframe.dropSeries(['state_fips']).resetIndex()
    }

    return newDataframe
      .renameSeries({
        [fipsColumn]: 'fips',
        [geoNameColumn]: 'fips_name',
      })
      .resetIndex()
  }

  removeUnrequestedColumns(df: IDataFrame, metricQuery: MetricQuery) {
    const dataFrame = df
    let requestedColumns = ['fips', 'fips_name'].concat(metricQuery.metricIds)

    if (metricQuery.timeView === 'historical') {
      requestedColumns.push(TIME_PERIOD)
    }

    // Add column names of enabled breakdowns
    requestedColumns = requestedColumns.concat(
      Object.entries(metricQuery.breakdowns.demographicBreakdowns)
        .filter(([_, breakdown]) => breakdown.enabled)
        .map(([_, breakdown]) => breakdown.columnName),
    )

    const columnsToRemove = dataFrame
      .getColumnNames()
      .filter((column) => !requestedColumns.includes(column))

    return dataFrame.dropSeries(columnsToRemove).resetIndex()
  }

  applyDemographicBreakdownFilters(
    df: IDataFrame,
    breakdowns: Breakdowns,
  ): IDataFrame {
    let dataFrame = df
    Object.values(breakdowns.demographicBreakdowns).forEach((demo) => {
      if (demo.enabled && demo.filter) {
        const filter = demo.filter
        dataFrame = dataFrame
          .where((row) => {
            const value = row[demo.columnName]
            return filter.include === filter.values.includes(value)
          })
          .resetIndex()
      }
    })
    return dataFrame
  }

  // add the requested demographic column to the ALLS df, with the value 'All' on each row
  castAllsAsRequestedDemographicBreakdown(
    df: IDataFrame,
    breakdowns: Breakdowns,
  ): IDataFrame {
    const requestedDemographic =
      breakdowns.getSoleDemographicBreakdown().columnName
    df = df.generateSeries((row) => {
      row[requestedDemographic] = 'All'
      return row
    })

    return df
  }

  abstract getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse>

  abstract allowsBreakdowns(
    breakdowns: Breakdowns,
    metricIds?: MetricId[],
  ): boolean

  // TODO: remove getDatasetId and getFallbackAllsDatasetId once all providers have migrated in favor of resolveDatasetId in datasetutils

  getDatasetId?(
    breakdown: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ): DatasetId | undefined

  getFallbackAllsDatasetId?(
    breakdown: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ): DatasetId | undefined
}

export default VariableProvider
