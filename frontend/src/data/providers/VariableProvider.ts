import type { MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { Breakdowns } from '../query/Breakdowns'
import {
  createMissingDataResponse,
  type MetricQuery,
  type MetricQueryResponse,
} from '../query/MetricQuery'
import { DatasetOrganizer } from '../sorting/DatasetOrganizer'
import { TIME_PERIOD } from '../utils/Constants'
import type { HetRow } from '../utils/DatasetTypes'

abstract class VariableProvider {
  readonly providerId: ProviderId
  readonly providesMetrics: MetricId[]

  constructor(providerId: ProviderId, providesMetrics: MetricId[]) {
    this.providerId = providerId
    this.providesMetrics = providesMetrics
  }

  async getData(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
    if (!this.allowsBreakdowns(metricQuery.breakdowns, metricQuery.metricIds)) {
      return createMissingDataResponse(
        'Breakdowns not supported for provider ' +
          this.providerId +
          ': ' +
          metricQuery.breakdowns.getUniqueKey(),
      )
    }

    // TODO: check that the metrics are all provided by this provider once we don't have providers relying on other providers
    const resp = await this.getDataInternal(metricQuery)
    new DatasetOrganizer(resp.data, metricQuery.breakdowns).organize()
    return resp
  }

  filterByGeo(rows: readonly HetRow[], breakdowns: Breakdowns): HetRow[] {
    const fipsColumn =
      breakdowns.geography === 'county' ? 'county_fips' : 'state_fips'
    if (breakdowns.filterFips !== undefined) {
      const fips = breakdowns.filterFips
      if (fips.isStateOrTerritory() && breakdowns.geography === 'county') {
        return rows.filter((row) => fips.isParentOf(row.county_fips))
      }
      return rows.filter((row) => row[fipsColumn] === fips.code)
    }
    return rows as HetRow[]
  }

  renameGeoColumns(rows: readonly HetRow[], breakdowns: Breakdowns): HetRow[] {
    const isCounty = breakdowns.geography === 'county'
    return rows.map((row) => {
      const { county_fips, county_name, state_fips, state_name, ...rest } = row
      if (isCounty) {
        return { ...rest, fips: county_fips, fips_name: county_name }
      }
      return { ...rest, fips: state_fips, fips_name: state_name }
    })
  }

  removeUnrequestedColumns(
    rows: readonly HetRow[],
    metricQuery: MetricQuery,
  ): HetRow[] {
    let requestedColumns = ['fips', 'fips_name', ...metricQuery.metricIds]
    if (metricQuery.timeView === 'historical') {
      requestedColumns.push(TIME_PERIOD)
    }
    requestedColumns = requestedColumns.concat(
      Object.values(metricQuery.breakdowns.demographicBreakdowns)
        .filter((breakdown) => breakdown.enabled)
        .map((breakdown) => breakdown.columnName),
    )
    const colSet = new Set(requestedColumns)
    return rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).filter(([key]) => colSet.has(key)),
      ),
    )
  }

  applyDemographicBreakdownFilters(
    rows: readonly HetRow[],
    breakdowns: Breakdowns,
  ): HetRow[] {
    let result: HetRow[] = rows as HetRow[]
    for (const demo of Object.values(breakdowns.demographicBreakdowns)) {
      if (demo.enabled && demo.filter) {
        const { include, values } = demo.filter
        result = result.filter(
          (row) => include === values.includes(row[demo.columnName]),
        )
      }
    }
    return result
  }

  // Stamps 'All' onto the requested demographic column for every row in an alls dataset.
  castAllsAsRequestedDemographicBreakdown(
    rows: readonly HetRow[],
    breakdowns: Breakdowns,
  ): HetRow[] {
    const column = breakdowns.getSoleDemographicBreakdown().columnName
    return rows.map((row) => ({ ...row, [column]: 'All' }))
  }

  abstract getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse>

  abstract allowsBreakdowns(
    breakdowns: Breakdowns,
    metricIds?: MetricId[],
  ): boolean
}

export default VariableProvider
