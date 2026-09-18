import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

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

const PHRMA_BRFSS_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_brfss_data' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'phrma_brfss_provider'

class PhrmaBrfssProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, PHRMA_BRFSS_METRICS, PHRMA_BRFSS_CONFIG)
  }
}

export default PhrmaBrfssProvider
