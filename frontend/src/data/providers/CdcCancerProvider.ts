import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

export const CDC_CANCER_SEX_SPECIFIC_DATATYPES: DataTypeId[] = [
  'breast_cancer_incidence',
  'cervical_cancer_incidence',
  'prostate_cancer_incidence',
]

export const CDC_CANCER_ALL_SEXES_DATATYPES: DataTypeId[] = [
  'colorectal_cancer_incidence',
  'lung_cancer_incidence',
]

const CDC_CANCER_METRICS: MetricId[] = [
  'breast_per_100k',
  'breast_per_100k_is_suppressed',
  'breast_estimated_total',
  'breast_population_pct',
  'breast_population_estimated_total',
  'breast_pct_share',
  'breast_pct_relative_inequity',
  'cervical_per_100k',
  'cervical_per_100k_is_suppressed',
  'cervical_estimated_total',
  'cervical_population_pct',
  'cervical_population_estimated_total',
  'cervical_pct_share',
  'cervical_pct_relative_inequity',
  'prostate_per_100k',
  'prostate_per_100k_is_suppressed',
  'prostate_estimated_total',
  'prostate_population_pct',
  'prostate_population_estimated_total',
  'prostate_pct_share',
  'prostate_pct_relative_inequity',
  'colorectal_per_100k',
  'colorectal_per_100k_is_suppressed',
  'colorectal_estimated_total',
  'colorectal_population_pct',
  'colorectal_population_estimated_total',
  'colorectal_pct_share',
  'colorectal_pct_relative_inequity',
  'lung_per_100k',
  'lung_per_100k_is_suppressed',
  'lung_estimated_total',
  'lung_population_pct',
  'lung_population_estimated_total',
  'lung_pct_share',
  'lung_pct_relative_inequity',
]

export const CDC_CANCER_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS = [
  [
    'Sex',
    "only available when comparing cancer incidence topics that aren't sex-specific",
  ],
]

// NCI county data is a single file (not split by state), so we skip the FIPS append
// that would otherwise try to load a state-partitioned file that does not exist.
const CDC_CANCER_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName:
      breakdowns.geography === 'county' ? 'nci_cancer' : 'cdc_wonder_data',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
  skipFipsAppend: true,
}

const PROVIDER_ID: ProviderId = 'cdc_cancer_provider'

class CdcCancerProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, CDC_CANCER_METRICS, CDC_CANCER_CONFIG)
  }
}

export default CdcCancerProvider
