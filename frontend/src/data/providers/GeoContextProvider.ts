import { getDataManager } from '../../utils/globals'
import type { DatasetId } from '../config/DatasetMetadata'
import type { Breakdowns, GeographicBreakdown } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const SVI = 'svi'
export const POPULATION = 'population'

class GeoContextProvider extends VariableProvider {
  constructor() {
    super('geo_context_provider', [SVI, POPULATION])
  }

  getDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
    if (breakdowns.geography === 'national') return 'geo_context-national'
    if (breakdowns.geography === 'state') return 'geo_context-state'
    if (breakdowns.geography === 'county') return 'geo_context-county'
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const datasetId = this.getDatasetId(breakdowns)
    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }

    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const geoContext = await getDataManager().loadDataset(specificDatasetId)

    let df = geoContext.toDataFrame()
    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    // handles both SVI and/or POPULATION requests, need to dynamically infer the consumed datasets for footer
    const consumedDatasetIds: DatasetId[] = []

    if (breakdowns.geography === 'county') {
      consumedDatasetIds.push('geo_context-county')
    }

    const acsDatasetMap: Record<GeographicBreakdown, DatasetId> = {
      county: 'acs_population-sex_county_current',
      state: 'acs_population-sex_state_current',
      national: 'acs_population-sex_national_current',
      // next entries are unused
      'state/territory': 'acs_population-sex_state_current',
      territory: 'decia_2020_territory_population-sex_state_current',
    }

    const decia2020DatasetMap: Record<GeographicBreakdown, DatasetId> = {
      county: 'decia_2020_territory_population-sex_county_current',
      state: 'decia_2020_territory_population-sex_state_current',
      national: 'acs_population-sex_national_current',
      // next entries are unused
      'state/territory': 'decia_2020_territory_population-sex_state_current',
      territory: 'decia_2020_territory_population-sex_state_current',
    }

    if (metricQuery.metricIds.includes(POPULATION)) {
      const datasetMap = breakdowns.filterFips?.isIslandArea()
        ? decia2020DatasetMap
        : acsDatasetMap
      const populationId = datasetMap[breakdowns.geography]
      populationId && consumedDatasetIds.push(populationId)
    }

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      (breakdowns.geography === 'county' ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      breakdowns.hasNoDemographicBreakdown()
    )
  }
}

export default GeoContextProvider
