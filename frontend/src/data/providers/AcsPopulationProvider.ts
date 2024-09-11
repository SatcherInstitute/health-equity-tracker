import type { IDataFrame } from 'data-forge'
import { getDataManager } from '../../utils/globals'
import type { Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'
import type { DatasetId } from '../config/DatasetMetadata'

export function GetAcsDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
  if (breakdowns.geography === 'national') {
    if (breakdowns.hasOnlyRace()) return 'acs_population-by_race_national'
    if (breakdowns.hasOnlyAge()) return 'acs_population-by_age_national'
    if (breakdowns.hasOnlySex()) return 'acs_population-by_sex_national'
  }
  if (breakdowns.geography === 'state') {
    if (breakdowns.hasOnlyRace()) return 'acs_population-by_race_state'
    if (breakdowns.hasOnlyAge()) return 'acs_population-by_age_state'
    if (breakdowns.hasOnlySex()) return 'acs_population-by_sex_state'
  }

  if (breakdowns.geography === 'county') {
    if (breakdowns.hasOnlyRace()) return 'acs_population-by_race_county'
    if (breakdowns.hasOnlyAge()) return 'acs_population-by_age_county'
    if (breakdowns.hasOnlySex()) return 'acs_population-by_sex_county'
  }
}

class AcsPopulationProvider extends VariableProvider {
  constructor() {
    super('acs_pop_provider', ['population_pct'])
  }

  // ALERT! KEEP IN SYNC! Make sure you update data/config/DatasetMetadata AND data/config/MetadataMap.ts if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
    return GetAcsDatasetId(breakdowns)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns

    let df = await this.getDataInternalWithoutPercents(breakdowns)

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    const datasetId = this.getDatasetId(breakdowns)
    let consumedDatasetIds
    if (datasetId) consumedDatasetIds = [datasetId]
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  private async getDataInternalWithoutPercents(
    breakdowns: Breakdowns,
  ): Promise<IDataFrame> {
    const datasetId = this.getDatasetId(breakdowns)
    if (!datasetId) throw Error('DatasetId undefined')
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const acsDataset = await getDataManager().loadDataset(specificDatasetId)
    let acsDataFrame = acsDataset.toDataFrame()

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    acsDataFrame = this.filterByGeo(acsDataFrame, breakdowns)
    acsDataFrame = this.renameGeoColumns(acsDataFrame, breakdowns)

    return acsDataFrame
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic()
  }
}

export default AcsPopulationProvider
