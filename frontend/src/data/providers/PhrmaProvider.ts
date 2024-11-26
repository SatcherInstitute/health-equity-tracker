import { getDataManager } from '../../utils/globals'
import type { DatasetId } from '../config/DatasetMetadata'
import type { DropdownVarId } from '../config/DropDownIds'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const PHRMA_CONDITIONS: DropdownVarId[] = [
  'medicare_cardiovascular',
  'medicare_hiv',
  'medicare_mental_health',
]

const PHRMA_ADHERENCE_DATATYPES: DataTypeId[] = [
  'anti_psychotics_adherence',
  'arv_adherence',
  'beta_blockers_adherence',
  'ccb_adherence',
  'doac_adherence',
  'bb_ami_adherence',
  'ras_antagonists_adherence',
  'statins_adherence',
]

const PHRMA_DISEASE_DATATYPES: DataTypeId[] = [
  'medicare_ami',
  'medicare_hiv',
  'medicare_schizophrenia',
]

export const PHRMA_DATATYPES: DataTypeId[] = [
  ...PHRMA_ADHERENCE_DATATYPES,
  ...PHRMA_DISEASE_DATATYPES,
]

export const PHRMA_METRICS: MetricId[] = [
  'anti_psychotics_adherence_estimated_total',
  'anti_psychotics_adherence_pct_rate',
  'anti_psychotics_adherence_pct_share',
  'anti_psychotics_beneficiaries_estimated_total',
  'anti_psychotics_population_pct_share',
  'arv_adherence_estimated_total',
  'arv_adherence_pct_rate',
  'arv_adherence_pct_share',
  'arv_beneficiaries_estimated_total',
  'arv_population_pct_share',
  'bb_ami_adherence_estimated_total',
  'bb_ami_adherence_pct_rate',
  'bb_ami_adherence_pct_share',
  'bb_ami_beneficiaries_estimated_total',
  'bb_ami_population_pct_share',
  'beta_blockers_adherence_estimated_total',
  'beta_blockers_adherence_pct_rate',
  'beta_blockers_adherence_pct_share',
  'beta_blockers_beneficiaries_estimated_total',
  'beta_blockers_population_pct_share',
  'ccb_adherence_estimated_total',
  'ccb_adherence_pct_rate',
  'ccb_adherence_pct_share',
  'ccb_beneficiaries_estimated_total',
  'ccb_population_pct_share',
  'doac_adherence_estimated_total',
  'doac_adherence_pct_rate',
  'doac_adherence_pct_share',
  'doac_beneficiaries_estimated_total',
  'doac_population_pct_share',
  'medicare_ami_estimated_total',
  'medicare_ami_pct_share',
  'medicare_ami_per_100k',
  'medicare_hiv_estimated_total',
  'medicare_hiv_pct_share',
  'medicare_hiv_per_100k',
  'medicare_schizophrenia_estimated_total',
  'medicare_schizophrenia_pct_share',
  'medicare_schizophrenia_per_100k',
  'medicare_population_pct_share',
  'medicare_population',
  'ras_antagonists_adherence_estimated_total',
  'ras_antagonists_adherence_pct_rate',
  'ras_antagonists_adherence_pct_share',
  'ras_antagonists_beneficiaries_estimated_total',
  'ras_antagonists_population_pct_share',
  'statins_adherence_estimated_total',
  'statins_adherence_pct_rate',
  'statins_adherence_pct_share',
  'statins_beneficiaries_estimated_total',
  'statins_population_pct_share',
]

const phrmaReason = 'only available when comparing two Medicare topics'

export const PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['lis', phrmaReason],
  ['Eligibility', phrmaReason],
]

export const SHOW_PHRMA_MENTAL_HEALTH = import.meta.env
  .VITE_SHOW_PHRMA_MENTAL_HEALTH

class PhrmaProvider extends VariableProvider {
  constructor() {
    super('phrma_provider', PHRMA_METRICS)
  }

  getDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
    if (breakdowns.geography === 'national') {
      if (breakdowns.hasOnlyRace())
        return 'phrma_data-race_and_ethnicity_national'
      if (breakdowns.hasOnlyAge()) return 'phrma_data-age_national'
      if (breakdowns.hasOnlySex()) return 'phrma_data-sex_national'
      if (breakdowns.hasOnlyLis()) return 'phrma_data-lis_national'
      if (breakdowns.hasOnlyEligibility())
        return 'phrma_data-eligibility_national'
    }
    if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace()) return 'phrma_data-race_and_ethnicity_state'
      if (breakdowns.hasOnlyAge()) return 'phrma_data-age_state'
      if (breakdowns.hasOnlySex()) return 'phrma_data-sex_state'
      if (breakdowns.hasOnlyLis()) return 'phrma_data-lis_state'
      if (breakdowns.hasOnlyEligibility()) return 'phrma_data-eligibility_state'
    }
    if (breakdowns.geography === 'county') {
      if (breakdowns.hasOnlyRace())
        return 'phrma_data-race_and_ethnicity_county'
      if (breakdowns.hasOnlyAge()) return 'phrma_data-age_county'
      if (breakdowns.hasOnlySex()) return 'phrma_data-sex_county'
      if (breakdowns.hasOnlyLis()) return 'phrma_data-lis_county'
      if (breakdowns.hasOnlyEligibility())
        return 'phrma_data-eligibility_county'
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
    const phrma = await getDataManager().loadDataset(specificDatasetId)
    let df = phrma.toDataFrame()

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)
    const consumedDatasetIds = [datasetId]

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
      (breakdowns.geography === 'county' ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default PhrmaProvider
