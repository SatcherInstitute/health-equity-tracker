import { getDataManager } from '../../utils/globals'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'

import { appendFipsIfNeeded } from '../utils/datasetutils'
import { GetAcsDatasetId } from './AcsPopulationProvider'
import VariableProvider from './VariableProvider'

// states with combined prison and jail systems
export const COMBINED_INCARCERATION_STATES_LIST = [
  'Alaska',
  'Connecticut',
  'Delaware',
  'Hawaii',
  'Rhode Island',
  'Vermont',
]

export const COMBINED_QUALIFIER = '(combined prison and jail)'
export const PRIVATE_JAILS_QUALIFIER = '(private jail system only)'

export const INCARCERATION_IDS: DataTypeId[] = ['prison', 'jail']

const JAIL_METRIC_IDS: MetricId[] = [
  'jail_pct_share',
  'jail_estimated_total',
  'jail_per_100k',
  'jail_pct_relative_inequity',
]

const PRISON_METRIC_IDS: MetricId[] = [
  'prison_pct_share',
  'prison_estimated_total',
  'prison_per_100k',
  'prison_pct_relative_inequity',
]

const INCARCERATION_METRIC_IDS: MetricId[] = [
  ...JAIL_METRIC_IDS,
  ...PRISON_METRIC_IDS,
  'confined_children_estimated_total',
  'incarceration_population_pct',
  'incarceration_population_estimated_total',
]

class IncarcerationProvider extends VariableProvider {
  constructor() {
    super('incarceration_provider', INCARCERATION_METRIC_IDS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const bq_dataset =
      metricQuery.breakdowns.geography === 'county'
        ? 'vera_incarceration_county'
        : 'bjs_incarceration_data'

    const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
      bq_dataset,
      '',
      metricQuery,
    )

    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }
    const specificDatasetId = isFallbackId
      ? datasetId
      : appendFipsIfNeeded(datasetId, breakdowns)
    const dataSource = await getDataManager().loadDataset(specificDatasetId)
    let df = dataSource.toDataFrame()

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    const consumedDatasetIds = [datasetId]

    // everything uses ACS except county-level reports and territory-reports
    if (
      breakdowns.geography !== 'county' &&
      !breakdowns.filterFips?.isIslandArea()
    ) {
      const acsId = GetAcsDatasetId(breakdowns)
      acsId && consumedDatasetIds.push(acsId)
    }

    // National Level - Map of all states + territory bubbles
    if (breakdowns.geography === 'state' && !breakdowns.filterFips) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-sex_territory_state_level',
      )
    }

    // Territory Level (Island Areas) - All cards
    if (breakdowns.filterFips?.isIslandArea()) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-sex_territory_state_level',
      )
      // only time-series cards use decia 2010
      if (metricQuery.timeView === 'historical') {
        consumedDatasetIds.push(
          'decia_2010_territory_population-sex_territory_state_level',
        )
      }
    }

    if (isFallbackId) {
      df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
    } else {
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
      df = this.removeUnrequestedColumns(df, metricQuery)
    }
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return (
      (breakdowns.geography === 'national' ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'county') &&
      validDemographicBreakdownRequest
    )
  }
}

export default IncarcerationProvider
