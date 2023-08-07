import { getDataManager } from '../../utils/globals'
import { type Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import VariableProvider from './VariableProvider'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { type DataTypeId, type MetricId } from '../config/MetricConfig'

export const ACS_CONDITION_DATATYPES: DataTypeId[] = [
  'health_insurance',
  'poverty',
]

export const ACS_CONDITION_METRICS: MetricId[] = [
  'uninsured_population_pct',
  'uninsured_pct_rate',
  'uninsured_pct_share',
  'uninsured_pct_relative_inequity',
  'poverty_population_pct',
  'poverty_pct_rate',
  'poverty_pct_share',
  'poverty_pct_relative_inequity',
]

class AcsConditionProvider extends VariableProvider {
  constructor() {
    super('acs_condition_provider', ACS_CONDITION_METRICS)
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlyRace()) {
      if (breakdowns.geography === 'county') {
        return appendFipsIfNeeded(
          'acs_condition-by_race_county_time_series',
          breakdowns
        )
      } else if (breakdowns.geography === 'state') {
        return 'acs_condition-by_race_state_time_series'
      } else if (breakdowns.geography === 'national') {
        return 'acs_condition-by_race_national_time_series'
      }
    }
    if (breakdowns.hasOnlyAge()) {
      if (breakdowns.geography === 'county') {
        return appendFipsIfNeeded(
          'acs_condition-by_age_county_time_series',
          breakdowns
        )
      } else if (breakdowns.geography === 'state') {
        return 'acs_condition-by_age_state_time_series'
      } else if (breakdowns.geography === 'national') {
        return 'acs_condition-by_age_national_time_series'
      }
    }
    if (breakdowns.hasOnlySex()) {
      if (breakdowns.geography === 'county') {
        return appendFipsIfNeeded(
          'acs_condition-by_sex_county_time_series',
          breakdowns
        )
      } else if (breakdowns.geography === 'state') {
        return 'acs_condition-by_sex_state_time_series'
      } else if (breakdowns.geography === 'national') {
        return 'acs_condition-by_sex_national_time_series'
      }
    }

    // Fallback for future breakdowns
    throw new Error('Not implemented')
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const timeView = metricQuery.timeView
    const datasetId = this.getDatasetId(breakdowns)
    const acsDataset = await getDataManager().loadDataset(datasetId)

    let df = acsDataset.toDataFrame()

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    df = this.filterByGeo(df, breakdowns)
    const mostRecentYear = '2021'
    df = this.filterByTimeView(df, timeView, mostRecentYear)
    df = this.renameGeoColumns(df, breakdowns)

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), [datasetId])
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic() && !breakdowns.time
  }
}

export default AcsConditionProvider
