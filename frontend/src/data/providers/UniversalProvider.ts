import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../config/DatasetMetadata'
import type { MetricId } from '../config/MetricConfigTypes'
import { getDataManagerRef } from '../loading/dataManagerRef'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import type { HetRow } from '../utils/DatasetTypes'
import type { StateFipsCode } from '../utils/FipsData'
import VariableProvider from './VariableProvider'

export interface DataSourceConfig {
  getDatasetDetails: (metricQuery: MetricQuery) => {
    datasetName: string
    tablePrefix?: string
  }
  getConsumedDatasetIds: (
    mainDatasetId: DatasetId,
    metricQuery: MetricQuery,
    breakdowns: Breakdowns,
  ) => Array<DatasetId | DatasetIdWithStateFIPSCode>
  allowsBreakdowns: (breakdowns: Breakdowns, metricIds?: MetricId[]) => boolean
  // Applied after renameGeoColumns, before the demographic cast/filter step.
  // Use for column remapping (GunViolence CHR) or time-based row filtering (CdcCovid).
  transformRows?: (
    rows: readonly HetRow[],
    metricQuery: MetricQuery,
  ) => HetRow[]
  // Set true when county data is not split by state FIPS (e.g. NCI cancer).
  skipFipsAppend?: boolean
  // Set true when county fallback (alls) data IS still split by state FIPS (e.g. gun violence).
  alwaysFipsAppend?: boolean
}

// Inlined here to avoid a circular dependency: datasetutils imports from AhrProvider
// and HivProvider, which both import UniversalProvider.
function appendFipsIfNeeded(
  baseId: DatasetId,
  breakdowns: Breakdowns,
): DatasetId | DatasetIdWithStateFIPSCode {
  if (breakdowns.geography !== 'county') return baseId
  const isCountyQueryFromStateLevelMap =
    breakdowns.geography === 'county' &&
    breakdowns.filterFips?.isStateOrTerritory()
  const fipsToAppend: StateFipsCode | undefined = isCountyQueryFromStateLevelMap
    ? breakdowns.filterFips?.code
    : breakdowns?.filterFips?.getParentFips()?.code
  return fipsToAppend
    ? (`${baseId}-${fipsToAppend}` as DatasetIdWithStateFIPSCode)
    : baseId
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

  allowsBreakdowns(breakdowns: Breakdowns, metricIds?: MetricId[]): boolean {
    return this.config.allowsBreakdowns(breakdowns, metricIds)
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

    const specificDatasetId =
      this.config.alwaysFipsAppend ||
      (!isFallbackId && !this.config.skipFipsAppend)
        ? appendFipsIfNeeded(datasetId, breakdowns)
        : datasetId
    const dataset = await getDataManagerRef().loadDataset(specificDatasetId)
    let df: HetRow[] = dataset.rows as HetRow[]

    const consumedDatasetIds = this.config.getConsumedDatasetIds(
      datasetId,
      metricQuery,
      breakdowns,
    )

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
