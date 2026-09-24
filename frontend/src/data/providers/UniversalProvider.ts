import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import { getDataManagerRef } from '../loading/dataManagerRef'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import type { HetRow } from '../utils/DatasetTypes'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

// Describes which DECIA territory population dataset(s) UniversalProvider should
// append to consumedDatasetIds when the query targets an island area (or all states).
// Keeps island-area dataset handling out of individual DataSourceConfig callbacks.
export interface IslandAreaPopulation {
  // Demographic dimension of the DECIA dataset; 'by_query' mirrors the active breakdown.
  demographic: 'race_and_ethnicity' | 'sex' | 'age' | 'by_query'
  // DECIA dataset geography; 'by_query' mirrors the request geography.
  geography: 'state' | 'county' | 'by_query'
  // Also add DECIA when filterFips is undefined (all-states national state-level view).
  includeAllStatesView?: boolean
  // Also push the 2010 DECIA dataset for historical time views.
  includeHistorical?: boolean
}

export interface DataSourceConfig {
  getDatasetDetails: (metricQuery: MetricQuery) => {
    datasetName: string
    tablePrefix?: string
  }
  // Defaults to [mainDatasetId] when omitted.
  getConsumedDatasetIds?: (
    mainDatasetId: DatasetId,
    metricQuery: MetricQuery,
    breakdowns: Breakdowns,
  ) => Array<DatasetId | DatasetIdWithStateFIPSCode>
  allowsBreakdowns: (breakdowns: Breakdowns, dataTypeId?: DataTypeId) => boolean
  // Applied after renameGeoColumns, before the demographic cast/filter step.
  // Use for column remapping (GunViolence CHR) or time-based row filtering (CdcCovid).
  transformRows?: (
    rows: readonly HetRow[],
    metricQuery: MetricQuery,
  ) => HetRow[]
  // Set true when county data is not split by state FIPS (e.g. NCI cancer).
  skipFipsAppend?: boolean
  // When set, UniversalProvider automatically appends the correct DECIA territory
  // population dataset(s) to consumedDatasetIds for island-area (and optionally
  // all-states) queries. Configs only need to guard addAcsIdToConsumed with
  // !isIslandArea; they no longer hardcode DECIA dataset ID strings.
  islandAreaPopulation?: IslandAreaPopulation
}

class UniversalProvider extends VariableProvider {
  private readonly config: DataSourceConfig

  constructor(
    providerId: ProviderId,
    metrics: MetricId[],
    config: DataSourceConfig,
  ) {
    super(providerId, metrics)
    this.config = config
  }

  allowsBreakdowns(breakdowns: Breakdowns, dataTypeId?: DataTypeId): boolean {
    return this.config.allowsBreakdowns(breakdowns, dataTypeId)
  }

  private islandAreaConsumedIds(
    breakdowns: Breakdowns,
    metricQuery: MetricQuery,
  ): DatasetId[] {
    const cfg = this.config.islandAreaPopulation
    if (!cfg) return []

    const isIsland = breakdowns.filterFips?.isIslandArea() ?? false
    const isAllStates = !breakdowns.filterFips
    if (!isIsland && !(cfg.includeAllStatesView && isAllStates)) return []

    const geo =
      cfg.geography === 'by_query' ? breakdowns.geography : cfg.geography
    if (geo === 'national') return []
    if (cfg.geography !== 'by_query' && breakdowns.geography !== geo) return []

    let demo: string
    if (cfg.demographic === 'by_query') {
      if (breakdowns.hasOnlyRace()) demo = 'race_and_ethnicity'
      else if (breakdowns.hasOnlySex()) demo = 'sex'
      else if (breakdowns.hasOnlyAge()) demo = 'age'
      else return []
    } else {
      demo = cfg.demographic
    }

    const datasets: DatasetId[] = [
      `decia_2020_territory_population-${demo}_${geo}_current` as DatasetId,
    ]
    if (cfg.includeHistorical && metricQuery.timeView === 'historical') {
      datasets.push(
        `decia_2010_territory_population-${demo}_${geo}_current` as DatasetId,
      )
    }
    return datasets
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const { datasetName, tablePrefix = '' } =
      this.config.getDatasetDetails(metricQuery)

    const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
      datasetName,
      tablePrefix,
      metricQuery,
    )

    if (!datasetId) return new MetricQueryResponse([], [])

    const specificDatasetId = this.config.skipFipsAppend
      ? datasetId
      : appendFipsIfNeeded(datasetId, breakdowns)
    const dataset = await getDataManagerRef(this.providerId).loadDataset(
      specificDatasetId,
    )
    let df: HetRow[] = dataset.rows as HetRow[]

    const consumedDatasetIds = [
      ...(this.config.getConsumedDatasetIds
        ? this.config.getConsumedDatasetIds(datasetId, metricQuery, breakdowns)
        : [datasetId]),
      ...this.islandAreaConsumedIds(breakdowns, metricQuery),
    ]

    df = this.filterByGeo(df, breakdowns)

    if (df.length === 0)
      return new MetricQueryResponse(
        [],
        consumedDatasetIds,
        undefined,
        !!isFallbackId,
      )

    df = this.renameGeoColumns(df, breakdowns)

    if (this.config.transformRows) {
      df = this.config.transformRows(df, metricQuery)
    }

    if (isFallbackId) {
      df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
    } else {
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
    }

    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(
      df,
      consumedDatasetIds,
      undefined,
      !!isFallbackId,
    )
  }
}

export default UniversalProvider
