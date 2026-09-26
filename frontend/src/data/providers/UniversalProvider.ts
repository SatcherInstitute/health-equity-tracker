import { type DatasetId, isValidDatasetId } from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type {
  DataSourceConfig,
  IslandAreaPopulation,
} from '../loading/DataSourceConfigs'
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

export type { DataSourceConfig, IslandAreaPopulation }

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

    const datasets: DatasetId[] = []
    const id2020 = `decia_2020_territory_population-${demo}_${geo}_current`
    if (isValidDatasetId(id2020)) {
      datasets.push(id2020)
    } else {
      console.warn(`UniversalProvider: invalid DECIA dataset ID: ${id2020}`)
    }
    if (cfg.includeHistorical && metricQuery.timeView === 'historical') {
      const id2010 = `decia_2010_territory_population-${demo}_${geo}_current`
      if (isValidDatasetId(id2010)) {
        datasets.push(id2010)
      } else {
        console.warn(`UniversalProvider: invalid DECIA dataset ID: ${id2010}`)
      }
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
