import type { DatasetId } from '../config/DatasetMetadata'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { GeographicBreakdown } from '../query/Breakdowns'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

export const SVI = 'svi'
export const POPULATION = 'population'

const acsDatasetMap: Partial<Record<GeographicBreakdown, DatasetId>> = {
  county: 'acs_population-sex_county_current',
  state: 'acs_population-sex_state_current',
  national: 'acs_population-sex_national_current',
}

const decia2020DatasetMap: Partial<Record<GeographicBreakdown, DatasetId>> = {
  county: 'decia_2020_territory_population-sex_county_current',
  state: 'decia_2020_territory_population-sex_state_current',
  national: 'acs_population-sex_national_current',
}

const GEO_CONTEXT_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'geo_context' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = []

    if (breakdowns.geography === 'county') consumedDatasetIds.push(mainId)

    if (metricQuery.metricIds.includes(POPULATION)) {
      const datasetMap = breakdowns.filterFips?.isIslandArea()
        ? decia2020DatasetMap
        : acsDatasetMap
      const populationId = datasetMap[breakdowns.geography]
      if (populationId) consumedDatasetIds.push(populationId)
    }

    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasNoDemographicBreakdown(),
}

const PROVIDER_ID: ProviderId = 'geo_context_provider'

class GeoContextProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, [SVI, POPULATION], GEO_CONTEXT_CONFIG)
  }
}

export default GeoContextProvider
