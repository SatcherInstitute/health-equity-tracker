import { getDataManager } from '../../utils/globals'
import { type DatasetId } from '../config/DatasetMetadata'
import {
  type DataTypeId,
  type DropdownVarId,
  type MetricId,
} from '../config/MetricConfig'
import { DemographicBreakdownKey, type Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

const CHR_DATATYPE_IDS_ONLY_ALLS: DataTypeId[] = [
  'diabetes',
  'excessive_drinking',
  'frequent_mental_distress',
  'voter_participation',
]

const CHR_DATATYPE_IDS_BY_RACE: DataTypeId[] = [
  'preventable_hospitalizations',
  'suicide',
]

export const CHR_DATATYPE_IDS: DataTypeId[] = [
  ...CHR_DATATYPE_IDS_ONLY_ALLS,
  ...CHR_DATATYPE_IDS_BY_RACE,
]


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

export const AHR_METRICS: MetricId[] = [
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

export const AHR_VOTER_AGE_METRICS: MetricId[] = [
  'voter_participation_pct_share',
  'voter_participation_pct_rate',
]

export const AHR_DECADE_PLUS_5_AGE_METRICS: MetricId[] = [
  'suicide_pct_share',
  'suicide_per_100k',
]

export const AHR_API_NH_METRICS: MetricId[] = [
  'preventable_hospitalizations_pct_share',
  'preventable_hospitalizations_per_100k',
]

export const ALL_AHR_METRICS = [
  ...AHR_VOTER_AGE_METRICS,
  ...AHR_DECADE_PLUS_5_AGE_METRICS,
  ...AHR_METRICS,
]

const CHR_METRICS: MetricId[] = [
  'suicide_per_100k',
  'voter_participation_pct_rate',
  'diabetes_per_100k',
  'excessive_drinking_per_100k',
  'frequent_mental_distress_per_100k',
  'preventable_hospitalizations_per_100k',
]

export const AHR_DATATYPES_WITH_MISSING_AGE_DEMO: DataTypeId[] = [
  'non_medical_drug_use',
  'preventable_hospitalizations',
]

export const AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Substance Misuse and Preventable Hospitalizations'],
]

export const CHR_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable at the county level'],
  ['Sex', 'unavailable at the county level'],
]

class AhrProvider extends VariableProvider {
  constructor() {
    super('ahr_provider', [
      'ahr_population_pct',
      ...AHR_METRICS,
      ...AHR_VOTER_AGE_METRICS,
      ...AHR_DECADE_PLUS_5_AGE_METRICS,
    ])
  }

  getDatasetId(breakdowns: Breakdowns, dataTypeId?: DataTypeId): DatasetId | undefined {

    if (breakdowns.geography === 'national') {
      if (breakdowns.hasOnlyRace())
        return 'graphql_ahr_data-race_and_ethnicity_national_current'
      if (breakdowns.hasOnlySex()) return 'graphql_ahr_data-sex_national_current'
      if (breakdowns.hasOnlyAge()) return 'graphql_ahr_data-age_national_current'
    }
    if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace()) return 'graphql_ahr_data-race_and_ethnicity_state_current'
      if (breakdowns.hasOnlySex()) return 'graphql_ahr_data-sex_state_current'
      if (breakdowns.hasOnlyAge()) return 'graphql_ahr_data-age_state_current'
    }
    // some county data is available via CHR
    if (breakdowns.geography === 'county' && dataTypeId && CHR_DATATYPE_IDS.includes(dataTypeId)) {
      if (breakdowns.hasExactlyOneDemographic()) return 'chr_data-race_and_ethnicity_county_current'
    }
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const { breakdowns, dataTypeId, timeView } = metricQuery
    const datasetId = this.getDatasetId(breakdowns, dataTypeId)

    if (!datasetId) throw Error('DatasetId undefined')
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const ahr = await getDataManager().loadDataset(specificDatasetId)
    let df = ahr.toDataFrame()

    const consumedDatasetIds = [datasetId]

    df = this.filterByGeo(df, breakdowns)
    df = this.filterByTimeView(df, timeView, '2021')
    df = this.renameGeoColumns(df, breakdowns)

    if (breakdowns.geography === 'county' && dataTypeId && CHR_DATATYPE_IDS.includes(dataTypeId) && !breakdowns.hasOnlyRace()) {
      let requestedDemographic: DemographicBreakdownKey = 'race_and_ethnicity'
      // CHR: treat the "All" rows from by race as "All" for sex/age
      df = df.filter((row) => row['race_and_ethnicity'] === 'All')
      if (breakdowns.hasOnlySex()) requestedDemographic = 'sex'
      if (breakdowns.hasOnlyAge()) requestedDemographic = 'age'
      df = df.renameSeries({
        'race_and_ethnicity': requestedDemographic
      })
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns, metricIds?: MetricId[]): boolean {

    const isValidCountyRequest = breakdowns.geography === 'county' && metricIds?.some((metricId) => CHR_METRICS.includes(metricId))

    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return (
      (
        (isValidCountyRequest) ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default AhrProvider
