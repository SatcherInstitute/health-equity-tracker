import { getDataManager } from '../../utils/globals'
import {
  type DropdownVarId,
  type DataTypeId,
  type MetricId,
} from '../config/MetricConfig'
import { type Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const SHOW_PHRMA = false
console.log('showing phrma?', SHOW_PHRMA)

export const PHRMA_CONDITIONS: DropdownVarId[] = [
  'phrma_cardiovascular',
  'phrma_hiv',
]

export const PHRMA_DATATYPES: DataTypeId[] = [
  'ami',
  'arv_adherence',
  'beta_blockers_adherence',
  'ccb_adherence',
  'doac_adherence',
  'nqf_adherence',
  'phrma_hiv',
  'rasa_adherence',
  'statins_adherence',
]

export const PHRMA_METRICS: MetricId[] = [
  'ami_pct_share',
  'ami_per_100k',
  'arv_adherence_pct_rate',
  'arv_adherence_pct_share',
  'arv_population_pct_share',
  'beta_blockers_adherence_pct_rate',
  'beta_blockers_adherence_pct_share',
  'beta_blockers_population_pct_share',
  'ccb_adherence_pct_rate',
  'ccb_adherence_pct_share',
  'ccb_population_pct_share',
  'doac_adherence_pct_rate',
  'doac_adherence_pct_share',
  'doac_population_pct_share',
  'nqf_adherence_pct_rate',
  'nqf_adherence_pct_share',
  'nqf_population_pct_share',
  'phrma_hiv_pct_share',
  'phrma_hiv_per_100k',
  'phrma_population_pct_share',
  'rasa_adherence_pct_rate',
  'rasa_adherence_pct_share',
  'rasa_population_pct_share',
  'statins_adherence_pct_rate',
  'statins_adherence_pct_share',
  'statins_population_pct_share',
]

const phrmaReason = 'only available when comparing two Medicare topics'

export const PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['lis', phrmaReason],
  ['Eligibility', phrmaReason],
]

class PhrmaProvider extends VariableProvider {
  constructor() {
    super('phrma_provider', PHRMA_METRICS)
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
      if (breakdowns.hasOnlyLis()) {
        return 'phrma_data-lis_national'
      }
      if (breakdowns.hasOnlyEligibility()) {
        return 'phrma_data-eligibility_national'
      }
    }
    if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace()) {
        return 'phrma_data-race_and_ethnicity_state'
      }
      if (breakdowns.hasOnlyAge()) return 'phrma_data-age_state'
      if (breakdowns.hasOnlySex()) return 'phrma_data-sex_state'
      if (breakdowns.hasOnlyLis()) {
        return 'phrma_data-lis_state'
      }
      if (breakdowns.hasOnlyEligibility()) {
        return 'phrma_data-eligibility_state'
      }
    }

    if (breakdowns.geography === 'county') {
      if (breakdowns.hasOnlyRace()) {
        return appendFipsIfNeeded(
          'phrma_data-race_and_ethnicity_county',
          breakdowns
        )
      }
      if (breakdowns.hasOnlyAge()) {
        return appendFipsIfNeeded('phrma_data-age_county', breakdowns)
      }
      if (breakdowns.hasOnlySex()) {
        return appendFipsIfNeeded('phrma_data-sex_county', breakdowns)
      }
      if (breakdowns.hasOnlyLis()) {
        return appendFipsIfNeeded('phrma_data-lis_county', breakdowns)
      }
      if (breakdowns.hasOnlyEligibility()) {
        return appendFipsIfNeeded('phrma_data-eligibility_county', breakdowns)
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
