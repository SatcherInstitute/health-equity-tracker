import { getDataManager } from '../../utils/globals'
import type { DatasetId } from '../config/DatasetMetadata'
import type {
  DropdownVarId,
  DataTypeId,
  MetricId,
} from '../config/MetricConfig'
import type { Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const SHOW_CANCER_SCREENINGS = import.meta.env.VITE_SHOW_CANCER_SCREENINGS

export const PHRMA_BRFSS_CONDITIONS: DropdownVarId[] = ['cancer_screening']

export const PHRMA_BRFSS_DATATYPES: DataTypeId[] = [
  'breast_cancer_screening',
  'cervical_cancer_screening',
  'colorectal_cancer_screening',
  'lung_cancer_screening',
  'prostate_cancer_screening',
]

export const PHRMA_BRFSS_METRICS: MetricId[] = [
  'breast_screened_estimated_total',
  'breast_screening_eligible_estimated_total',
  'breast_screened_pct_rate',
  'breast_screened_pct_share',
  'breast_screening_eligible_population_pct',
  'breast_screened_ratio_age_adjusted',
  'cervical_screened_estimated_total',
  'cervical_screening_eligible_estimated_total',
  'cervical_screened_pct_rate',
  'cervical_screened_pct_share',
  'cervical_screening_eligible_population_pct',
  'cervical_screened_ratio_age_adjusted',
  'colorectal_screened_estimated_total',
  'colorectal_screening_eligible_estimated_total',
  'colorectal_screened_pct_rate',
  'colorectal_screened_pct_share',
  'colorectal_screening_eligible_population_pct',
  'colorectal_screened_ratio_age_adjusted',
  'lung_screened_estimated_total',
  'lung_screening_eligible_estimated_total',
  'lung_screened_pct_rate',
  'lung_screened_pct_share',
  'lung_screening_eligible_population_pct',
  'lung_screened_ratio_age_adjusted',
  'prostate_screened_estimated_total',
  'prostate_screening_eligible_estimated_total',
  'prostate_screened_pct_rate',
  'prostate_screened_pct_share',
  'prostate_screening_eligible_population_pct',
  'prostate_screened_ratio_age_adjusted',
]

const phrmaBrfssReason =
  'only available when comparing two cancer screening topics'

export const PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['income', phrmaBrfssReason],
  ['insurance_status', phrmaBrfssReason],
  ['education', phrmaBrfssReason],
]

export const SHOW_PHRMA_BRFSS = import.meta.env.VITE_SHOW_PHRMA_BRFSS

class PhrmaBrfssProvider extends VariableProvider {
  constructor() {
    super('phrma_brfss_provider', PHRMA_BRFSS_METRICS)
  }

  getDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
    if (breakdowns.geography === 'national') {
      if (breakdowns.hasOnlyRace())
        return 'phrma_brfss_data-race_and_ethnicity_national'
      if (breakdowns.hasOnlyAge()) return 'phrma_brfss_data-age_national'
      if (breakdowns.hasOnlyInsuranceStatus())
        return 'phrma_brfss_data-insurance_status_national'
      if (breakdowns.hasOnlyIncome()) return 'phrma_brfss_data-income_national'
      if (breakdowns.hasOnlyEducation())
        return 'phrma_brfss_data-education_national'
    }
    if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace())
        return 'phrma_brfss_data-race_and_ethnicity_state'
      if (breakdowns.hasOnlyAge()) return 'phrma_brfss_data-age_state'
      if (breakdowns.hasOnlyInsuranceStatus())
        return 'phrma_brfss_data-insurance_status_state'
      if (breakdowns.hasOnlyIncome()) return 'phrma_brfss_data-income_state'
      if (breakdowns.hasOnlyEducation())
        return 'phrma_brfss_data-education_state'
    }
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const datasetId = this.getDatasetId(breakdowns)
    if (!datasetId) throw Error('DatasetId undefined')
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const phrma = await getDataManager().loadDataset(specificDatasetId)
    let df = phrma.toDataFrame()

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)
    const consumedDatasetIds = [datasetId]

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
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

export default PhrmaBrfssProvider
