import type { IDataFrame } from 'data-forge'
import { CARDS_THAT_SHOULD_FALLBACK_TO_ALLS } from '../../reports/reportUtils'
import { isValidDatasetId, type DatasetId } from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type {
  Breakdowns,
  DemographicType,
  GeographicBreakdown,
  TimeView,
} from '../query/Breakdowns'
import {
  createMissingDataResponse,
  type MetricQuery,
  type MetricQueryResponse,
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

  // Returns an object that contains the datasetId or fallbackId, the breakdowns object, and the useFallback flag to trigger casting an ALLS table as the requested demographic
  // If the requested datasetId is not found, returns undefined triggering an empty metricQueryResponse
  resolveDatasetOrFallbackId(metricQuery: MetricQuery): {
    breakdowns: Breakdowns
    datasetId?: DatasetId
    useFallback?: boolean
  } {
    const { breakdowns, timeView } = metricQuery
    const requestedDemographic: DemographicType =
      breakdowns.getSoleDemographicBreakdown().columnName
    const requestedGeography: GeographicBreakdown = breakdowns.geography

    // Normal, valid demographic request
    const requestedDatasetId: string = `maternal_mortality_data-by_${requestedDemographic}_${requestedGeography}_${timeView}`
    if (isValidDatasetId(requestedDatasetId)) {
      return {
        breakdowns,
        datasetId: requestedDatasetId as DatasetId,
      }
    }

    // Handle tables that still use `race` instead of `race_and_ethnicity`
    if (breakdowns.hasOnlyRace()) {
      const requestedRaceDatasetId: string = `maternal_mortality_data-by_race_${requestedGeography}_${timeView}`
      if (isValidDatasetId(requestedRaceDatasetId)) {
        return {
          breakdowns,
          datasetId: requestedRaceDatasetId as DatasetId,
        }
      }
    }

    // Fallback to ALLS
    const fallbackAllsDatasetId: string = `maternal_mortality_data-by_alls_${requestedGeography}_${timeView}`
    if (isValidDatasetId(fallbackAllsDatasetId)) {
      const isFallbackEligible =
        metricQuery.scrollToHashId &&
        CARDS_THAT_SHOULD_FALLBACK_TO_ALLS.includes(metricQuery.scrollToHashId)

      return {
        breakdowns,
        datasetId: isFallbackEligible
          ? (fallbackAllsDatasetId as DatasetId)
          : undefined,
        useFallback: isFallbackEligible,
      }
    }

    // No valid dataset or fallback
    return { breakdowns }
  }

  abstract getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse>

  abstract allowsBreakdowns(
    breakdowns: Breakdowns,
    metricIds?: MetricId[],
  ): boolean

  // TODO: remove getDatasetId and getFallbackAllsDatasetId once all providers have migrated in favor of resolveDatasetOrFallbackId above

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
