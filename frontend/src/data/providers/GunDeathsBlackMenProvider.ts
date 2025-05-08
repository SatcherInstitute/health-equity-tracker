import { getDataManager } from '../../utils/globals'
import type { MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

const GUN_DEATHS_BLACK_MEN_METRIC_IDS: MetricId[] = [
  'gun_homicides_black_men_estimated_total',
  'gun_homicides_black_men_pct_relative_inequity',
  'gun_homicides_black_men_pct_share',
  'gun_homicides_black_men_per_100k',
  'gun_homicides_black_men_population_estimated_total',
  'gun_homicides_black_men_population_pct',
]

const reason = 'unavailable for intersectional Black men topics'
export const BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Race/Ethnicity', reason],
  ['Sex', reason],
]

export const BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS_URBANICITY = [
  ['City Size', 'unavailable for when comparing these topics'],
]

class GunViolenceBlackMenProvider extends VariableProvider {
  constructor() {
    super('gun_violence_black_men_provider', GUN_DEATHS_BLACK_MEN_METRIC_IDS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    try {
      const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
        'cdc_wisqars_black_men_data',
        'black_men_by_',
        metricQuery,
      )

      if (!datasetId) {
        return new MetricQueryResponse([], [])
      }

      const gunViolenceBlackMenData =
        await getDataManager().loadDataset(datasetId)
      let df = gunViolenceBlackMenData.toDataFrame()

      df = this.filterByGeo(df, breakdowns)
      df = this.renameGeoColumns(df, breakdowns)
      if (isFallbackId) {
        df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
      } else {
        df = this.applyDemographicBreakdownFilters(df, breakdowns)
        df = this.removeUnrequestedColumns(df, metricQuery)
      }

      const consumedDatasetIds = [datasetId]
      return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
    } catch (error) {
      console.error('Error fetching gun homicides of Black men data:', error)
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

export default GunViolenceBlackMenProvider
