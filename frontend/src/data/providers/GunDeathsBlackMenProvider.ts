import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import { getDataManager } from '../../utils/globals'
import type { Breakdowns, TimeView } from '../query/Breakdowns'
import type { DatasetId } from '../config/DatasetMetadata'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

export const GUN_DEATHS_BLACK_MEN_DATATYPES: DataTypeId[] = [
  'gun_deaths_black_men',
]

export const GUN_DEATHS_BLACK_MEN_METRIC_IDS: MetricId[] = [
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
  ['Urbanicity', 'unavailable for when comparing these topics'],
]

class GunViolenceBlackMenProvider extends VariableProvider {
  constructor() {
    super('gun_violence_black_men_provider', GUN_DEATHS_BLACK_MEN_METRIC_IDS)
  }

  getDatasetId(
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ): DatasetId | undefined {
    if (timeView === 'current') {
      if (breakdowns.hasOnlyUrbanicity()) {
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_current'
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_current'
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_black_men_data-black_men_by_age_national_current'
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_black_men_data-black_men_by_age_state_current'
      }
    }

    if (timeView === 'historical') {
      if (breakdowns.hasOnlyUrbanicity()) {
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_historical'
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_historical'
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_black_men_data-black_men_by_age_national_historical'
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_black_men_data-black_men_by_age_state_historical'
      }
    }
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    try {
      const { breakdowns, dataTypeId, timeView } = metricQuery

      const datasetId = this.getDatasetId(breakdowns, dataTypeId, timeView)

      if (!datasetId) {
        return new MetricQueryResponse([], [])
      }

      const gunViolenceBlackMenData =
        await getDataManager().loadDataset(datasetId)
      let df = gunViolenceBlackMenData.toDataFrame()

      df = this.filterByGeo(df, breakdowns)
      df = this.renameGeoColumns(df, breakdowns)
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
      df = this.removeUnrequestedColumns(df, metricQuery)

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
