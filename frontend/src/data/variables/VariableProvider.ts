import { type IDataFrame } from 'data-forge'
import { type MetricId, type VariableId } from '../config/MetricConfig'
import { type ProviderId } from '../loading/VariableProviderMap'
import { type Breakdowns, type TimeView } from '../query/Breakdowns'
import {
  createMissingDataResponse,
  type MetricQuery,
  type MetricQueryResponse,
} from '../query/MetricQuery'
import { DatasetOrganizer } from '../sorting/DatasetOrganizer'
import { CROSS_SECTIONAL, TIME_SERIES, TIME_PERIOD } from '../utils/Constants'

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
          metricQuery.breakdowns.getUniqueKey()
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

  filterByTimeView(
    df: IDataFrame,
    timeView: TimeView,
    sourceCurrentTimePeriod?: string
  ): IDataFrame {
    // This method should only be used when the CROSS_SECTIONAL VEGA dataset is a recent subset of the TIME_SERIES D3 dataset
    // For other sources like COVID, the TIME_SERIES set is in a distinct table that doesn't need the added filtering

    // for updated datasets
    // - return recent slice for CROSS
    // - return full df for LONG

    // for older datasets
    // - return full set for CROSS
    // - return empty df for LONG to trigger missing data on compare view

    // const currentTimePeriod = sourceCurrentTimePeriod || "current"

    if (df.getColumnNames().includes(TIME_PERIOD)) {
      if (timeView === CROSS_SECTIONAL) {
        df = df.where((row) => row[TIME_PERIOD] === sourceCurrentTimePeriod)
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

    if (metricQuery.timeView === TIME_SERIES) {
      requestedColumns.push(TIME_PERIOD)
    }

    // Add column names of enabled breakdowns
    requestedColumns = requestedColumns.concat(
      Object.entries(metricQuery.breakdowns.demographicBreakdowns)
        .filter(([unusedKey, breakdown]) => breakdown.enabled)
        .map(([unusedKey, breakdown]) => breakdown.columnName)
    )

    const columnsToRemove = dataFrame
      .getColumnNames()
      .filter((column) => !requestedColumns.includes(column))

    return dataFrame.dropSeries(columnsToRemove).resetIndex()
  }

  applyDemographicBreakdownFilters(
    df: IDataFrame,
    breakdowns: Breakdowns
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

  abstract getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse>

  abstract allowsBreakdowns(
    breakdowns: Breakdowns,
    metricIds?: MetricId[]
  ): boolean

  abstract getDatasetId(
    breakdown: Breakdowns,
    dataType?: string,
    timeView?: TimeView,
    variableId?: VariableId
  ): string
}

export default VariableProvider
