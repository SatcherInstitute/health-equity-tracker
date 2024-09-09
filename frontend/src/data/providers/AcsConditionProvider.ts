import { getDataManager } from '../../utils/globals'
import type { TimeView, Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import VariableProvider from './VariableProvider'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { DatasetId } from '../config/DatasetMetadata'

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
  'uninsured_estimated_total',
  'uninsured_pop_estimated_total',
  'poverty_estimated_total',
  'poverty_pop_estimated_total',
]

class AcsConditionProvider extends VariableProvider {
  constructor() {
    super('acs_condition_provider', ACS_CONDITION_METRICS)
  }

  getDatasetId(
    breakdowns: Breakdowns,
    _dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ): DatasetId | undefined {
    if (timeView === 'historical') {
      if (breakdowns.geography === 'national') {
        if (breakdowns.hasOnlyRace())
          return 'acs_condition-by_race_national_historical'
        if (breakdowns.hasOnlyAge())
          return 'acs_condition-by_age_national_historical'
        if (breakdowns.hasOnlySex())
          return 'acs_condition-by_sex_national_historical'
      }
      if (breakdowns.geography === 'state') {
        if (breakdowns.hasOnlyRace())
          return 'acs_condition-by_race_state_historical'
        if (breakdowns.hasOnlyAge())
          return 'acs_condition-by_age_state_historical'
        if (breakdowns.hasOnlySex())
          return 'acs_condition-by_sex_state_historical'
      }

      if (breakdowns.geography === 'county') {
        if (breakdowns.hasOnlyRace())
          return 'acs_condition-by_race_county_historical'
        if (breakdowns.hasOnlyAge())
          return 'acs_condition-by_age_county_historical'
        if (breakdowns.hasOnlySex())
          return 'acs_condition-by_sex_county_historical'
      }
    }

    if (timeView === 'current') {
      if (breakdowns.geography === 'national') {
        if (breakdowns.hasOnlyRace())
          return 'acs_condition-by_race_national_current'
        if (breakdowns.hasOnlyAge())
          return 'acs_condition-by_age_national_current'
        if (breakdowns.hasOnlySex())
          return 'acs_condition-by_sex_national_current'
      }
      if (breakdowns.geography === 'state') {
        if (breakdowns.hasOnlyRace())
          return 'acs_condition-by_race_state_current'
        if (breakdowns.hasOnlyAge()) return 'acs_condition-by_age_state_current'
        if (breakdowns.hasOnlySex()) return 'acs_condition-by_sex_state_current'
      }

      if (breakdowns.geography === 'county') {
        if (breakdowns.hasOnlyRace())
          return 'acs_condition-by_race_county_current'
        if (breakdowns.hasOnlyAge())
          return 'acs_condition-by_age_county_current'
        if (breakdowns.hasOnlySex())
          return 'acs_condition-by_sex_county_current'
      }
    }
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const timeView = metricQuery.timeView
    const datasetId = this.getDatasetId(breakdowns, undefined, timeView)
    if (!datasetId) throw Error('DatasetId undefined')
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const acsDataset = await getDataManager().loadDataset(specificDatasetId)

    let df = acsDataset.toDataFrame()

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), [datasetId])
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic()
  }
}

export default AcsConditionProvider
