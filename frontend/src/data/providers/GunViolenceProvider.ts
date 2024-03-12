import { appendFipsIfNeeded } from '../utils/datasetutils'
import { type Breakdowns } from '../query/Breakdowns'
import { DataTypeId, MetricId } from '../config/MetricConfig'
import { type DatasetId } from '../config/DatasetMetadata'
import { getDataManager } from '../../utils/globals'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

export const SHOW_GUN_VIOLENCE = import.meta.env.VITE_SHOW_GUN_VIOLENCE

export const GUN_VIOLENCE_DATATYPES: DataTypeId[] = [
  'gun_violence_homicide',
  'gun_violence_injuries',
  'gun_violence_legal_intervention',
  'gun_violence_suicide',
]

export const GUN_VIOLENCE_HOMICIDE_METRICS: MetricId[] = [
  'gun_violence_homicide_estimated_total',
  'gun_violence_homicide_pct_relative_inequity',
  'gun_violence_homicide_pct_share',
  'gun_violence_homicide_per_100k',
]

export const GUN_VIOLENCE_INJURIES_METRICS: MetricId[] = [
  'gun_violence_injuries_estimated_total',
  'gun_violence_injuries_pct_relative_inequity',
  'gun_violence_injuries_pct_share',
  'gun_violence_injuries_per_100k',
]

export const GUN_VIOLENCE_LEGAL_INTERVENTION_METRICS: MetricId[] = [
  'gun_violence_legal_intervention_estimated_total',
  'gun_violence_legal_intervention_pct_relative_inequity',
  'gun_violence_legal_intervention_pct_share',
  'gun_violence_legal_intervention_per_100k',
]

export const GUN_VIOLENCE_SUICIDE_METRICS: MetricId[] = [
  'gun_violence_suicide_estimated_total',
  'gun_violence_suicide_pct_relative_inequity',
  'gun_violence_suicide_pct_share',
  'gun_violence_suicide_per_100k',
]

export const POPULATION_METRICS: MetricId[] = [
  'fatal_population_pct',
  'fatal_population',
  'non_fatal_population_pct',
  'non_fatal_population',
]

const GUN_VIOLENCE_METRICS: MetricId[] = [
  ...GUN_VIOLENCE_HOMICIDE_METRICS,
  ...GUN_VIOLENCE_INJURIES_METRICS,
  ...GUN_VIOLENCE_LEGAL_INTERVENTION_METRICS,
  ...GUN_VIOLENCE_SUICIDE_METRICS,
  ...POPULATION_METRICS,
]

class GunViolenceProvider extends VariableProvider {
  constructor() {
    super('gun_violence_provider', GUN_VIOLENCE_METRICS)
  }

  getDatasetId(
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: string
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
    metricQuery: MetricQuery
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
      console.error('Error fetching gun violence data:', error)
      throw error
    }
  }

  allowsBreakdowns(
    breakdowns: Breakdowns,
    metricIds?: MetricId[] | undefined
  ): boolean {
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
