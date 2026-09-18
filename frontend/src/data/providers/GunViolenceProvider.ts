import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { HetRow } from '../utils/DatasetTypes'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

export const GUN_VIOLENCE_DATATYPES: DataTypeId[] = [
  'gun_violence_homicide',
  'gun_violence_suicide',
  'gun_deaths',
]

const GUN_HOMICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_homicide_estimated_total',
  'gun_violence_homicide_pct_relative_inequity',
  'gun_violence_homicide_pct_share',
  'gun_violence_homicide_per_100k',
  'gun_violence_homicide_per_100k_is_suppressed',
]

const GUN_SUICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_suicide_estimated_total',
  'gun_violence_suicide_pct_relative_inequity',
  'gun_violence_suicide_pct_share',
  'gun_violence_suicide_per_100k',
  'gun_violence_suicide_per_100k_is_suppressed',
]

const GUN_DEATHS_METRIC_IDS: MetricId[] = [
  'gun_deaths_estimated_total',
  'gun_deaths_pct_relative_inequity',
  'gun_deaths_pct_share',
  'gun_deaths_per_100k',
  'gun_deaths_per_100k_is_suppressed',
]

const POPULATION_METRIC_IDS: MetricId[] = [
  'fatal_population_pct',
  'fatal_population',
]

const GUN_VIOLENCE_METRIC_IDS: MetricId[] = [
  ...GUN_HOMICIDE_METRIC_IDS,
  ...GUN_SUICIDE_METRIC_IDS,
  ...GUN_DEATHS_METRIC_IDS,
  ...POPULATION_METRIC_IDS,
  'gun_violence_legal_intervention_estimated_total',
]

function isChrRequest(metricQuery: {
  dataTypeId?: DataTypeId
  breakdowns: { geography: string }
}) {
  return (
    metricQuery.dataTypeId === 'gun_deaths' &&
    metricQuery.breakdowns.geography === 'county'
  )
}

const GUN_VIOLENCE_CONFIG: DataSourceConfig = {
  getDatasetDetails: (metricQuery) => {
    const isMiovd =
      (metricQuery.dataTypeId === 'gun_violence_homicide' ||
        metricQuery.dataTypeId === 'gun_violence_suicide') &&
      metricQuery.breakdowns.geography === 'county'

    const datasetName = isMiovd
      ? 'cdc_miovd_data'
      : isChrRequest(metricQuery)
        ? 'chr_data'
        : 'cdc_wisqars_data'

    return { datasetName }
  },
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
  // County alls datasets are still split by state FIPS, so always append even on fallback.
  alwaysFipsAppend: true,
  // CHR county data uses different population column names than other sources.
  transformRows: (rows, metricQuery) => {
    if (!isChrRequest(metricQuery)) return rows as HetRow[]
    return rows.map(
      ({ chr_population_pct, chr_population_estimated_total, ...rest }) => ({
        ...rest,
        fatal_population_pct: chr_population_pct,
        fatal_population: chr_population_estimated_total,
      }),
    )
  },
}

const PROVIDER_ID: ProviderId = 'gun_violence_provider'

class GunViolenceProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, GUN_VIOLENCE_METRIC_IDS, GUN_VIOLENCE_CONFIG)
  }
}

export default GunViolenceProvider
