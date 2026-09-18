import type { DatasetId } from '../config/DatasetMetadata'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { GeographicBreakdown } from '../query/Breakdowns'
import { addAcsIdToConsumed } from '../utils/datasetutils'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

const reason =
  'demographics for COVID vaccination unavailable at state and county levels'
export const COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', reason],
  ['Sex', reason],
]

const datasetNameMappings: Record<GeographicBreakdown, string> = {
  national: 'cdc_vaccination_national',
  state: 'kff_vaccination',
  territory: 'kff_vaccination',
  'state/territory': 'kff_vaccination',
  county: 'cdc_vaccination_county',
}

const VACCINE_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName: datasetNameMappings[breakdowns.geography],
  }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    addAcsIdToConsumed(metricQuery, consumedDatasetIds)

    if (breakdowns.geography === 'state') {
      if (
        breakdowns.filterFips === undefined ||
        breakdowns.filterFips?.isIslandArea()
      ) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-race_and_ethnicity_state_current',
        )
      }
    }

    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['national', 'state', 'county'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'vaccine_provider'

class VaccineProvider extends UniversalProvider {
  constructor() {
    super(
      PROVIDER_ID,
      [
        'acs_vaccinated_pop_pct',
        'vaccinated_pct_share',
        'vaccinated_pct_rate',
        'vaccinated_pop_pct',
        'vaccinated_estimated_total',
      ],
      VACCINE_CONFIG,
    )
  }
}

export default VaccineProvider
