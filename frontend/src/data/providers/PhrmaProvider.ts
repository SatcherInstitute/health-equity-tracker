import { getDataManager } from '../../utils/globals'
import { type MetricId } from '../config/MetricConfig'
import { type Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
// import { appendFipsIfNeeded } from "../utils/datasetutils";
import VariableProvider from './VariableProvider'

export const PHRMA_DETERMINANTS: MetricId[] = [
  'statins_adherence_pct_rate',
  'statins_adherence_pct_share',
  'statins_population_pct_share',
  'beta_blockers_adherence_pct_rate',
  'beta_blockers_adherence_pct_share',
  'beta_blockers_population_pct_share',
  'rasa_adherence_pct_rate',
  'rasa_adherence_pct_share',
  'rasa_population_pct_share',
  'arv_adherence_pct_rate',
  'arv_adherence_pct_share',
  'arv_population_pct_share',
  'ccb_adherence_pct_rate',
  'ccb_adherence_pct_share',
  'ccb_population_pct_share',
  'doac_adherence_pct_rate',
  'doac_adherence_pct_share',
  'doac_population_pct_share',
  'nqf_adherence_pct_rate',
  'nqf_adherence_pct_share',
  'nqf_population_pct_share',
  'phrma_hiv_per_100k',
  'phrma_hiv_pct_share',
  'phrma_hiv_population_pct_share',
  'ami_per_100k',
  'ami_pct_share',
  'ami_population_pct_share',
]

class PhrmaProvider extends VariableProvider {
  constructor() {
    super('phrma_provider', PHRMA_DETERMINANTS)
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === 'national') {
      if (breakdowns.hasOnlyRace()) {
        return 'phrma_data-race_and_ethnicity_national'
      }
      if (breakdowns.hasOnlyAge()) {
        return 'phrma_data-age_national'
      }
      if (breakdowns.hasOnlySex()) {
        return 'phrma_data-sex_national'
      }
    }
    if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace()) {
        return 'phrma_data-race_and_ethnicity_state'
      }
      if (breakdowns.hasOnlyAge()) return 'phrma_data-age_state'
      if (breakdowns.hasOnlySex()) return 'phrma_data-sex_state'
    }

    if (breakdowns.geography === 'county') {
      if (breakdowns.hasOnlyRace()) {
        return 'phrma_data-race_and_ethnicity_county'
      }
      if (breakdowns.hasOnlyAge()) {
        return 'phrma_data-age_county'
      }
      if (breakdowns.hasOnlySex()) {
        return 'phrma_data-sex_county'
      }
    }
    throw new Error('Not implemented')
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const datasetId = this.getDatasetId(breakdowns)
    const phrma = await getDataManager().loadDataset(datasetId)
    let df = phrma.toDataFrame()

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)
    const consumedDatasetIds = [datasetId]

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic()

    return (
      (breakdowns.geography === 'county' ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default PhrmaProvider
