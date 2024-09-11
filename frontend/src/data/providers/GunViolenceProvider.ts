import type { Breakdowns } from '../query/Breakdowns'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { DatasetId } from '../config/DatasetMetadata'
import { getDataManager } from '../../utils/globals'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

export const GUN_VIOLENCE_DATATYPES: DataTypeId[] = [
  'gun_violence_homicide',
  'gun_violence_suicide',
]

export const GUN_HOMICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_homicide_estimated_total',
  'gun_violence_homicide_pct_relative_inequity',
  'gun_violence_homicide_pct_share',
  'gun_violence_homicide_per_100k',
]

export const GUN_SUICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_suicide_estimated_total',
  'gun_violence_suicide_pct_relative_inequity',
  'gun_violence_suicide_pct_share',
  'gun_violence_suicide_per_100k',
]

export const POPULATION_METRIC_IDS: MetricId[] = [
  'fatal_population_pct',
  'fatal_population',
]

const GUN_DEATH_METRIC_IDS: MetricId[] = [
  ...GUN_HOMICIDE_METRIC_IDS,
  ...GUN_SUICIDE_METRIC_IDS,
  ...POPULATION_METRIC_IDS,
  'gun_violence_legal_intervention_estimated_total',
]

class GunViolenceProvider extends VariableProvider {
  constructor() {
    super('gun_violence_provider', GUN_DEATH_METRIC_IDS)
  }

  getDatasetId(
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: string,
  ): DatasetId | undefined {
    if (timeView === 'current') {
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_data-age_state_current'
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_data-age_national_current'
      }
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_data-race_and_ethnicity_state_current'
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_data-race_and_ethnicity_national_current'
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_data-sex_state_current'
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_data-sex_national_current'
      }
    }

    if (timeView === 'historical') {
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_data-age_state_historical'
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_data-age_national_historical'
      }
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_data-race_and_ethnicity_state_historical'
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_data-race_and_ethnicity_national_historical'
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === 'state')
          return 'cdc_wisqars_data-sex_state_historical'
        if (breakdowns.geography === 'national')
          return 'cdc_wisqars_data-sex_national_historical'
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
        throw new Error('DatasetId is undefined.')
      }

      const gunViolenceData = await getDataManager().loadDataset(datasetId)
      let df = gunViolenceData.toDataFrame()

      df = this.filterByGeo(df, breakdowns)
      df = this.renameGeoColumns(df, breakdowns)
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
      df = this.removeUnrequestedColumns(df, metricQuery)

      const consumedDatasetIds = [datasetId]
      return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
    } catch (error) {
      console.error('Error fetching gun deaths data:', error)
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

export default GunViolenceProvider
