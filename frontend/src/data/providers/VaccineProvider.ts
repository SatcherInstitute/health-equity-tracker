import { getDataManager } from '../../utils/globals'
import { type Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import type AcsPopulationProvider from './AcsPopulationProvider'
import { GetAcsDatasetId } from './AcsPopulationProvider'
import VariableProvider from './VariableProvider'
import { RACE } from '../utils/Constants'

const reason =
  'demographics for COVID vaccination unavailable at state and county levels'
export const COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', reason],
  ['Sex', reason],
]

class VaccineProvider extends VariableProvider {
  private readonly acsProvider: AcsPopulationProvider

  constructor(acsProvider: AcsPopulationProvider) {
    super('vaccine_provider', [
      'acs_vaccinated_pop_pct',
      'vaccinated_pct_share',
      'vaccinated_per_100k',
      'vaccinated_pop_pct',
    ])
    this.acsProvider = acsProvider
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === 'national') {
      if (breakdowns.hasOnlyRace())
        return 'cdc_vaccination_national-race_processed'
      if (breakdowns.hasOnlySex())
        return 'cdc_vaccination_national-sex_processed'
      if (breakdowns.hasOnlyAge())
        return 'cdc_vaccination_national-age_processed'
    }
    if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace())
        return 'kff_vaccination-race_and_ethnicity_state'
      // WE HAVE THE ALLS SO CAN AT LEAST SHOW THOSE FOR AGE OR SEX REPORTS
      if (breakdowns.hasOnlySex() || breakdowns.hasOnlyAge())
        return 'kff_vaccination-alls_state'
    }
    if (breakdowns.geography === 'county') {
      return appendFipsIfNeeded(
        'cdc_vaccination_county-race_and_ethnicity_processed',
        breakdowns
      )
    }
    throw new Error('Not implemented')
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const timeView = metricQuery.timeView

    const datasetId = this.getDatasetId(breakdowns)
    const vaxData = await getDataManager().loadDataset(datasetId)
    let df = vaxData.toDataFrame()

    df = this.filterByTimeView(df, timeView)

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    const acsBreakdowns = breakdowns.copy()
    acsBreakdowns.time = false

    let consumedDatasetIds = [datasetId]

    if (breakdowns.geography === 'national') {
      consumedDatasetIds = consumedDatasetIds.concat(
        GetAcsDatasetId(breakdowns)
      )
    } else if (breakdowns.geography === 'state') {
      consumedDatasetIds = consumedDatasetIds.concat(
        'acs_population-by_race_state'
      )

      if (breakdowns.filterFips === undefined) {
        consumedDatasetIds = consumedDatasetIds.concat(
          'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level'
        )
      }
      if (breakdowns.filterFips?.isIslandArea()) {
        consumedDatasetIds = consumedDatasetIds.concat(
          'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level'
        )
      }
    } else if (breakdowns.geography === 'county') {
      // We merge this in on the backend, no need to redownload it here
      // but we want to provide the proper citation
      consumedDatasetIds = consumedDatasetIds.concat(
        'acs_population-by_race_county'
      )
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic()

    return (
      (breakdowns.geography === 'national' ||
        (breakdowns.geography === 'state' &&
          breakdowns.getSoleDemographicBreakdown().columnName === RACE) ||
        (breakdowns.geography === 'county' &&
          breakdowns.getSoleDemographicBreakdown().columnName === RACE)) &&
      validDemographicBreakdownRequest
    )
  }
}

export default VaccineProvider
