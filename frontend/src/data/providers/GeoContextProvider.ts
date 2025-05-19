import { getDataManager } from '../../utils/globals'
import type { DatasetId } from '../config/DatasetMetadata'
import type { Breakdowns, GeographicBreakdown } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const SVI = 'svi'
export const POPULATION = 'population'

class GeoContextProvider extends VariableProvider {
  constructor() {
    super('geo_context_provider', [SVI, POPULATION])
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const { datasetId, breakdowns } = resolveDatasetId(
      'geo_context',
      '',
      metricQuery,
    )
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

    if (breakdowns.geography === 'county') consumedDatasetIds.push(datasetId)

    const acsDatasetMap: Partial<Record<GeographicBreakdown, DatasetId>> = {
      county: 'acs_population-sex_county_current',
      state: 'acs_population-sex_state_current',
      national: 'acs_population-sex_national_current',
    }

    const decia2020DatasetMap: Partial<Record<GeographicBreakdown, DatasetId>> =
      {
        county: 'decia_2020_territory_population-sex_county_current',
        state: 'decia_2020_territory_population-sex_state_current',
        national: 'acs_population-sex_national_current',
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
