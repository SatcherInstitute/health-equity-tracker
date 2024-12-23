import { getParentDropdownFromDataTypeId } from '../../utils/MadLibs'
import { getDataManager } from '../../utils/globals'
import type { DropdownVarId } from '../config/DropDownIds'
import { BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS } from '../config/MetricConfigBehavioralHealth'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
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
  'ahr_population_estimated_total',
  'ahr_population_18plus',
  'asthma_pct_share',
  'asthma_per_100k',
  'asthma_estimated_total',
  'avoided_care_pct_share',
  'avoided_care_pct_rate',
  'avoided_care_estimated_total',
  'cardiovascular_diseases_pct_share',
  'cardiovascular_diseases_per_100k',
  'cardiovascular_diseases_estimated_total',
  'chronic_kidney_disease_pct_share',
  'chronic_kidney_disease_per_100k',
  'chronic_kidney_disease_estimated_total',
  'copd_pct_share',
  'copd_per_100k',
  'copd_estimated_total',
  'depression_pct_share',
  'depression_per_100k',
  'depression_estimated_total',
  'diabetes_pct_share',
  'diabetes_per_100k',
  'diabetes_estimated_total',
  'excessive_drinking_pct_share',
  'excessive_drinking_per_100k',
  'excessive_drinking_estimated_total',
  'frequent_mental_distress_pct_share',
  'frequent_mental_distress_per_100k',
  'frequent_mental_distress_estimated_total',
  'non_medical_drug_use_pct_share',
  'non_medical_drug_use_per_100k',
  'non_medical_drug_use_estimated_total',
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
  'suicide_estimated_total',
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

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const { isChr, categoryPrefix } = getDatasetDetails(metricQuery)
    const { datasetId, isFallbackId, breakdowns } = resolveDatasetId(
      isChr ? 'chr_data' : 'graphql_ahr_data',
      isChr ? '' : categoryPrefix,
      metricQuery,
    )

    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const ahr = await getDataManager().loadDataset(specificDatasetId)
    let df = ahr.toDataFrame()

    const consumedDatasetIds = [datasetId]

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    if (isFallbackId) {
      df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
    } else {
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
      df = this.removeUnrequestedColumns(df, metricQuery)
    }

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns, metricIds?: MetricId[]): boolean {
    const isValidCountyRequest =
      breakdowns.geography === 'county' &&
      metricIds?.some((metricId) => CHR_METRICS.includes(metricId))

    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return (
      (isValidCountyRequest ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default AhrProvider

function getDatasetDetails(metricQuery: MetricQuery) {
  const { dataTypeId, breakdowns } = metricQuery
  if (
    dataTypeId &&
    CHR_DATATYPE_IDS.includes(dataTypeId) &&
    breakdowns.geography === 'county'
  )
    return { isChr: true, categoryPrefix: '' }

  const currentDropdown: DropdownVarId | undefined =
    dataTypeId && getParentDropdownFromDataTypeId(dataTypeId)

  const isBehavioralHealth =
    currentDropdown &&
    BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS.includes(currentDropdown as any)

  const categoryPrefix = isBehavioralHealth
    ? 'behavioral_health_'
    : 'non-behavioral_health_'

  return { isChr: false, categoryPrefix }
}
