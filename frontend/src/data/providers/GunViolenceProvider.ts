import { getDataManager } from '../../utils/globals'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

export const GUN_VIOLENCE_DATATYPES: DataTypeId[] = [
  'gun_violence_homicide',
  'gun_violence_suicide',
]

export const GUN_HOMICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_homicide_estimated_total',
  'gun_violence_homicide_pct_relative_inequity',
  'gun_violence_homicide_pct_share',
  'gun_violence_homicide_per_100k',
]

export const GUN_SUICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_suicide_estimated_total',
  'gun_violence_suicide_pct_relative_inequity',
  'gun_violence_suicide_pct_share',
  'gun_violence_suicide_per_100k',
]

export const POPULATION_METRIC_IDS: MetricId[] = [
  'fatal_population_pct',
  'fatal_population',
]

const GUN_DEATH_METRIC_IDS: MetricId[] = [
  ...GUN_HOMICIDE_METRIC_IDS,
  ...GUN_SUICIDE_METRIC_IDS,
  ...POPULATION_METRIC_IDS,
  'gun_violence_legal_intervention_estimated_total',
]

class GunViolenceProvider extends VariableProvider {
  constructor() {
    super('gun_violence_provider', GUN_DEATH_METRIC_IDS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    try {
      const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
        'cdc_wisqars_data',
        '', // TODO: only some tables prepend with `_by`; we should standardize frontend/backend table naming
        metricQuery,
      )
      if (!datasetId) {
        throw new Error('DatasetId is undefined.')
      }

      const gunViolenceData = await getDataManager().loadDataset(datasetId)
      let df = gunViolenceData.toDataFrame()

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
    } catch (error) {
      console.error('Error fetching gun deaths data:', error)
      throw error
    }
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

export default GunViolenceProvider
