import { getDataManager } from '../../utils/globals'
import type { Breakdowns, GeographicBreakdown } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

const reason =
  'demographics for COVID vaccination unavailable at state and county levels'
export const COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', reason],
  ['Sex', reason],
]

const datasetNameMappings: Record<GeographicBreakdown, string> = {
  national: 'cdc_vaccination_national',
  state: 'kff_vaccination',
  territory: 'kff_vaccination',
  'state/territory': 'kff_vaccination',
  county: 'cdc_vaccination_county',
}

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

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const bqDatasetName = datasetNameMappings[metricQuery.breakdowns.geography]

    const { datasetId, isFallbackId, breakdowns } = resolveDatasetId(
      bqDatasetName,
      '',
      metricQuery,
    )

    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }

    const specificDatasetId = isFallbackId
      ? datasetId
      : appendFipsIfNeeded(datasetId, breakdowns)
    const vaxData = await getDataManager().loadDataset(specificDatasetId)
    let df = vaxData.toDataFrame()

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    const consumedDatasetIds = [datasetId]

    const { datasetId: acsId } = resolveDatasetId(
      'acs_population',
      '',
      metricQuery,
    )
    acsId && consumedDatasetIds.push(acsId)

    if (breakdowns.geography === 'state') {
      if (breakdowns.filterFips === undefined) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-race_and_ethnicity_state_current',
        )
      }
      if (breakdowns.filterFips?.isIslandArea()) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-race_and_ethnicity_state_current',
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
      ['national', 'state', 'county'].includes(breakdowns.geography) &&
      validDemographicBreakdownRequest
    )
  }
}

export default VaccineProvider
