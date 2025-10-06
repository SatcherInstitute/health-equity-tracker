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
  'gun_deaths',
]

const GUN_HOMICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_homicide_estimated_total',
  'gun_violence_homicide_pct_relative_inequity',
  'gun_violence_homicide_pct_share',
  'gun_violence_homicide_per_100k',
]

const GUN_SUICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_suicide_estimated_total',
  'gun_violence_suicide_pct_relative_inequity',
  'gun_violence_suicide_pct_share',
  'gun_violence_suicide_per_100k',
]

const GUN_DEATHS_METRIC_IDS: MetricId[] = [
  'gun_deaths_estimated_total',
  'gun_deaths_pct_relative_inequity',
  'gun_deaths_pct_share',
  'gun_deaths_per_100k',
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

class GunViolenceProvider extends VariableProvider {
  constructor() {
    super('gun_violence_provider', GUN_VIOLENCE_METRIC_IDS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    try {
      const { breakdowns } = metricQuery

      const isChr =
        metricQuery.dataTypeId === 'gun_deaths' &&
        breakdowns.geography === 'county'

      const isMiovd =
        (metricQuery.dataTypeId === 'gun_violence_homicide' ||
          metricQuery.dataTypeId === 'gun_violence_suicide') &&
        breakdowns.geography === 'county'

      let datasetName: string
      if (isMiovd) {
        datasetName = 'cdc_miovd_data'
      } else if (isChr) {
        datasetName = 'chr_data'
      } else {
        datasetName = 'cdc_wisqars_data'
      }

      const { datasetId, isFallbackId } = resolveDatasetId(
        datasetName,
        '',
        metricQuery,
      )
      if (!datasetId) {
        return new MetricQueryResponse([], [])
      }

      const gunViolenceData = await getDataManager().loadDataset(datasetId)
      let df = gunViolenceData.toDataFrame()

      df = this.filterByGeo(df, breakdowns)
      df = this.renameGeoColumns(df, breakdowns)
      if (isChr) {
        df = df.renameSeries({
          chr_population_pct: 'fatal_population_pct',
          chr_population_estimated_total: 'fatal_population',
        })
      }
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
      (breakdowns.geography === 'county' ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default GunViolenceProvider
