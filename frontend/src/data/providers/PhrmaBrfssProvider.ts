import { getDataManager } from '../../utils/globals'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const PHRMA_BRFSS_SEX_SPECIFIC_DATATYPES: DataTypeId[] = [
  'breast_cancer_screening',
  'cervical_cancer_screening',
  'prostate_cancer_screening',
]

export const PHRMA_BRFSS_ALL_SEXES_DATATYPES: DataTypeId[] = [
  'colorectal_cancer_screening',
  'lung_cancer_screening',
]

const PHRMA_BRFSS_METRICS: MetricId[] = [
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
  ['Income', phrmaBrfssReason],
  ['Insurance Status', phrmaBrfssReason],
  ['Education', phrmaBrfssReason],
]

export const PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS = [
  ...PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_DETAILS,
  [
    'Sex',
    "only available when comparing cancer screening topics that aren't sex-specific",
  ],
]

class PhrmaBrfssProvider extends VariableProvider {
  constructor() {
    super('phrma_brfss_provider', PHRMA_BRFSS_METRICS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
      'phrma_brfss_data',
      '',
      metricQuery,
    )

    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }

    const specificDatasetId = isFallbackId
      ? datasetId
      : appendFipsIfNeeded(datasetId, breakdowns)

    const phrma = await getDataManager().loadDataset(specificDatasetId)
    let df = phrma.toDataFrame()

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
