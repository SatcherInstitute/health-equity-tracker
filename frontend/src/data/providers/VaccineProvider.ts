import { getDataManager } from '../../utils/globals'
import type { DatasetId } from '../config/DatasetMetadata'
import type { Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { GetAcsDatasetId } from './AcsPopulationProvider'
import VariableProvider from './VariableProvider'

const reason =
  'demographics for COVID vaccination unavailable at state and county levels'
export const COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', reason],
  ['Sex', reason],
]

class VaccineProvider extends VariableProvider {
  constructor() {
    super('vaccine_provider', [
      'acs_vaccinated_pop_pct',
      'vaccinated_pct_share',
      'vaccinated_pct_rate',
      'vaccinated_pop_pct',
      'vaccinated_estimated_total',
    ])
  }

  getDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
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
      return 'cdc_vaccination_county-alls_county'
    }
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
    const vaxData = await getDataManager().loadDataset(specificDatasetId)
    let df = vaxData.toDataFrame()

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    const consumedDatasetIds = [datasetId]

    if (breakdowns.geography === 'national') {
      const acsId = GetAcsDatasetId(breakdowns)
      acsId && consumedDatasetIds.push(acsId)
    }
    if (breakdowns.geography === 'state') {
      consumedDatasetIds.push('acs_population-by_race_state')

      if (breakdowns.filterFips === undefined) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level',
        )
      }
      if (breakdowns.filterFips?.isIslandArea()) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level',
        )
      }
    }
    if (breakdowns.geography === 'county') {
      // We merge this in on the backend, no need to redownload it here
      // but we want to provide the proper citation
      consumedDatasetIds.push('acs_population-by_race_county')
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return (
      ['national', 'state', 'county'].includes(breakdowns.geography) &&
      validDemographicBreakdownRequest
    )
  }
}

export default VaccineProvider
