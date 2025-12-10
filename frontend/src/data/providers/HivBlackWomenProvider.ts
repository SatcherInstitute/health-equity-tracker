import { getDataManager } from '../../utils/globals'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const BLACK_WOMEN_DATATYPES: DataTypeId[] = [
  'hiv_deaths_black_women',
  'hiv_diagnoses_black_women',
  'hiv_prevalence_black_women',
]

export const BLACK_WOMEN_METRICS: MetricId[] = [
  'hiv_deaths_black_women',
  'hiv_deaths_black_women_pct_relative_inequity',
  'hiv_deaths_black_women_pct_share',
  'hiv_deaths_black_women_per_100k',
  'hiv_diagnoses_black_women',
  'hiv_diagnoses_black_women_pct_relative_inequity',
  'hiv_diagnoses_black_women_pct_share',
  'hiv_diagnoses_black_women_per_100k',
  'hiv_prevalence_black_women',
  'hiv_prevalence_black_women_pct_relative_inequity',
  'hiv_prevalence_black_women_pct_share',
  'hiv_prevalence_black_women_per_100k',
  'black_women_population_count',
  'black_women_population_pct',
]

const reason = 'unavailable for intersectional Black women topics'
export const BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Race/Ethnicity', reason],
  ['Sex', reason],
]

class HivBlackWomenProvider extends VariableProvider {
  constructor() {
    super('hiv_black_women_provider', BLACK_WOMEN_METRICS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const tablePrefix = 'black_women_by_'

    const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
      'cdc_hiv_data',
      tablePrefix,
      metricQuery,
    )

    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }

    const consumedDatasetIds = [datasetId]
    const specificDatasetId = isFallbackId
      ? datasetId
      : appendFipsIfNeeded(datasetId, breakdowns)

    const hiv = await getDataManager().loadDataset(specificDatasetId)
    let df = hiv.toDataFrame()
    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    if (isFallbackId) {
      df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
    } else {
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
      df = this.removeUnrequestedColumns(df, metricQuery)
    }

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns, _metricIds: MetricId[]): boolean {
    const validGeography =
      breakdowns.geography === 'state' || breakdowns.geography === 'national'

    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return validGeography && validDemographicBreakdownRequest
  }
}

export default HivBlackWomenProvider
