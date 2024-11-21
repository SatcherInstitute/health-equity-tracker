import { getDataManager } from '../../utils/globals'
import type { MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import { MetricQueryResponse, type MetricQuery } from '../query/MetricQuery'
import { resolveDatasetOrFallbackId } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

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

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    try {
      const { breakdowns, datasetId, useFallback } = resolveDatasetOrFallbackId(
        'maternal_mortality_data',
        'by_',
        metricQuery,
      )

      if (!datasetId) {
        return new MetricQueryResponse([], [])
      }

      const maternalMortalityDataset =
        await getDataManager().loadDataset(datasetId)
      const consumedDatasetIds = [datasetId]
      let df = maternalMortalityDataset.toDataFrame()
      df = this.filterByGeo(df, breakdowns)

      if (df.toArray().length === 0) {
        return new MetricQueryResponse([], consumedDatasetIds)
      }
      df = this.renameGeoColumns(df, breakdowns)

      if (useFallback) {
        df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
      } else {
        df = this.applyDemographicBreakdownFilters(df, breakdowns)
        df = this.removeUnrequestedColumns(df, metricQuery)
      }

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
