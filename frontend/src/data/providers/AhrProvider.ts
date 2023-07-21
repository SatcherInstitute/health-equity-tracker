import { getDataManager } from '../../utils/globals'
import {
  type DataTypeId,
  type DropdownVarId,
  type MetricId,
} from '../config/MetricConfig'
import { type Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

export const AHR_CONDITIONS: DropdownVarId[] = [
  'asthma',
  'avoided_care',
  'cardiovascular_diseases',
  'chronic_kidney_disease',
  'copd',
  'depression',
  'diabetes',
  'excessive_drinking',
  'frequent_mental_distress',
  'preventable_hospitalizations',
  'substance',
  'suicide',
  'voter_participation',
]

export const AHR_DETERMINANTS: MetricId[] = [
  'ahr_population_pct',
  'asthma_pct_share',
  'asthma_per_100k',
  'avoided_care_pct_share',
  'avoided_care_pct_rate',
  'cardiovascular_diseases_pct_share',
  'cardiovascular_diseases_per_100k',
  'chronic_kidney_disease_pct_share',
  'chronic_kidney_disease_per_100k',
  'copd_pct_share',
  'copd_per_100k',
  'depression_pct_share',
  'depression_per_100k',
  'diabetes_pct_share',
  'diabetes_per_100k',
  'excessive_drinking_pct_share',
  'excessive_drinking_per_100k',
  'frequent_mental_distress_pct_share',
  'frequent_mental_distress_per_100k',
  'non_medical_drug_use_pct_share',
  'non_medical_drug_use_per_100k',
  'preventable_hospitalizations_pct_share',
  'preventable_hospitalizations_per_100k',
]

export const AHR_VOTER_AGE_DETERMINANTS: MetricId[] = [
  'voter_participation_pct_share',
  'voter_participation_pct_rate',
]

export const AHR_DECADE_PLUS_5_AGE_DETERMINANTS: MetricId[] = [
  'suicide_pct_share',
  'suicide_per_100k',
]

export const AHR_API_NH_DETERMINANTS: MetricId[] = [
  'preventable_hospitalizations_pct_share',
  'preventable_hospitalizations_per_100k',
]

export const ALL_AHR_DETERMINANTS = [
  ...AHR_VOTER_AGE_DETERMINANTS,
  ...AHR_DECADE_PLUS_5_AGE_DETERMINANTS,
  ...AHR_DETERMINANTS,
]

export const AHR_DATATYPES_WITH_MISSING_AGE_DEMO: DataTypeId[] = [
  'non_medical_drug_use',
  'preventable_hospitalizations',
]

export const AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Substance Misuse and Preventable Hospitalizations'],
]

class AhrProvider extends VariableProvider {
  constructor() {
    super('ahr_provider', [
      'ahr_population_pct',
      ...AHR_DETERMINANTS,
      ...AHR_VOTER_AGE_DETERMINANTS,
      ...AHR_DECADE_PLUS_5_AGE_DETERMINANTS,
    ])
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === 'national') {
      if (breakdowns.hasOnlyRace()) {
        return 'ahr_data-race_and_ethnicity_national'
      } else if (breakdowns.hasOnlySex()) {
        return 'ahr_data-sex_national'
      } else if (breakdowns.hasOnlyAge()) {
        return 'ahr_data-age_national'
      }
    } else if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace()) {
        return 'ahr_data-race_and_ethnicity_state'
      } else if (breakdowns.hasOnlySex()) {
        return 'ahr_data-sex_state'
      } else if (breakdowns.hasOnlyAge()) {
        return 'ahr_data-age_state'
      }
    }
    throw new Error('Not implemented')
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const timeView = metricQuery.timeView
    const datasetId = this.getDatasetId(breakdowns)
    const ahr = await getDataManager().loadDataset(datasetId)
    let df = ahr.toDataFrame()

    const consumedDatasetIds = [datasetId]

    df = this.filterByGeo(df, breakdowns)
    df = this.filterByTimeView(df, timeView, '2021')
    df = this.renameGeoColumns(df, breakdowns)

    df = this.applyDemographicBreakdownFilters(df, breakdowns)

    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic()

    return (
      (breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default AhrProvider
