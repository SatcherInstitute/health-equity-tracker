import type { DataTypeId, MetricId } from '../config/MetricConfig'
import { getDataManager } from '../../utils/globals'
import type { TimeView, Breakdowns } from '../query/Breakdowns'
import type { DatasetId } from '../config/DatasetMetadata'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import VariableProvider from './VariableProvider'
import { appendFipsIfNeeded } from '../utils/datasetutils'

export const SHOW_NEW_MATERNAL_MORTALITY = import.meta.env
  .VITE_SHOW_NEW_MATERNAL_MORTALITY

export const MATERNAL_MORTALITY_METRIC_IDS: MetricId[] = [
  'maternal_mortality_per_100k',
  'maternal_mortality_pct_share',
  'maternal_mortality_population_pct',
  'maternal_deaths_estimated_total',
  'live_births_estimated_total',
]

export const MATERNAL_MORTALITY_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Maternal Mortality'],
  ['Sex', 'unavailable for Maternal Mortality'],
]

class MaternalMortalityProvider extends VariableProvider {
  constructor() {
    super('maternal_mortality_provider', MATERNAL_MORTALITY_METRIC_IDS)
  }

  getDatasetId(
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ): DatasetId | undefined {
    if (timeView === 'current') {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'state')
          return 'maternal_mortality_data-by_race_state_current'
        if (breakdowns.geography === 'national')
          return 'maternal_mortality_data-by_race_national_current'
      }
    }
    if (timeView === 'historical') {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'state')
          return 'maternal_mortality_data-by_race_state_historical'
        if (breakdowns.geography === 'national')
          return 'maternal_mortality_data-by_race_national_historical'
      }
    }
    console.log(breakdowns, timeView)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    try {
      const breakdowns = metricQuery.breakdowns
      const datasetId = this.getDatasetId(
        breakdowns,
        undefined,
        metricQuery.timeView,
      )
      if (!datasetId) throw Error('DatasetId is undefined')
      const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
      const maternalMortalityDataset =
        await getDataManager().loadDataset(specificDatasetId)
      const consumedDatasetIds = [datasetId]
      let df = maternalMortalityDataset.toDataFrame()

      // Filter by geography
      df = this.filterByGeo(df, breakdowns)

      if (df.toArray().length === 0) {
        return new MetricQueryResponse([], consumedDatasetIds)
      }
      df = this.renameGeoColumns(df, breakdowns)

      // Apply demographic breakdown filters
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
      df = this.removeUnrequestedColumns(df, metricQuery)

      return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
    } catch (error) {
      console.error('Error fetching maternal mortality data:', error)
      throw error
    }
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return (
      (breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default MaternalMortalityProvider
