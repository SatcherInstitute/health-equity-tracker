import { CARDS_THAT_SHOULD_FALLBACK_TO_ALLS } from '../../reports/reportUtils'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { DemographicGroup } from '../utils/Constants'
import type { FieldRange, HetRow } from '../utils/DatasetTypes'
import type { Breakdowns, DemographicType, TimeView } from './Breakdowns'

export class MetricQuery {
  readonly metricIds: MetricId[]
  readonly breakdowns: Breakdowns
  readonly dataTypeId: DataTypeId | undefined
  readonly timeView: TimeView
  scrollToHashId?: ScrollableHashId

  constructor(
    metricIds: MetricId | MetricId[],
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
    scrollToHashId?: ScrollableHashId,
  ) {
    this.metricIds = [metricIds].flat()
    this.breakdowns = breakdowns
    this.dataTypeId = dataTypeId
    this.timeView = timeView ?? 'current'
    this.scrollToHashId = scrollToHashId
  }

  getUniqueKey(): string {
    return (
      this.metricIds.join(',') +
      ':____:' +
      this.breakdowns.getUniqueKey() +
      ':____:' +
      this.timeView
    )
  }
}

function getInvalidValues(rows: HetRow[]) {
  const invalidValues: Record<string, number> = {}
  rows.forEach((row: HetRow) => {
    Object.entries(row).forEach(([fieldName, value]) => {
      if (value === undefined || value === null) {
        const currentValue = invalidValues[fieldName] || 0
        invalidValues[fieldName] = currentValue + 1
      }
    })
  })
  return invalidValues
}

export function createMissingDataResponse(missingDataMessage: string) {
  return new MetricQueryResponse(
    [],
    /* consumedDatasetIds= */ [],
    missingDataMessage,
  )
}

export class MetricQueryResponse {
  readonly data: HetRow[]
  readonly missingDataMessage: string | undefined
  readonly invalidValues: Record<string, number>
  readonly consumedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode>

  constructor(
    data: HetRow[],
    consumedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> = [],
    missingDataMessage: string | undefined = undefined,
  ) {
    this.data = data
    this.consumedDatasetIds = consumedDatasetIds
    this.invalidValues = getInvalidValues(this.data)
    this.missingDataMessage = missingDataMessage // possibly undefined
    if (this.missingDataMessage === undefined && this.data.length <= 0) {
      this.missingDataMessage = 'No rows returned'
    }
  }

  dataIsMissing(): boolean {
    return this.missingDataMessage !== undefined
  }

  isFieldMissing(fieldName: DemographicType | MetricId): boolean {
    return this.invalidValues[fieldName] === this.data.length
  }

  // Calculate numerical range for a field or return undefined if not applicable
  getFieldRange(fieldName: MetricId): FieldRange | undefined {
    const fieldValues = this.data
      .filter((row) => !isNaN(row[fieldName]) && row[fieldName] != null)
      .map((row) => row[fieldName])
    if (fieldValues.length === 0) {
      return undefined
    }

    return {
      min: Math.min(...fieldValues),
      max: Math.max(...fieldValues),
    }
  }

  // Filters rows to those for which the requested field has a valid value
  getValidRowsForField(fieldName: DemographicType | MetricId) {
    return this.data.filter(
      (row: HetRow) => row[fieldName] !== undefined && row[fieldName] !== null,
    )
  }

  // Generate two arrays of demographic groups, with and without data in the target metric field
  getFieldValues(
    fieldName: DemographicType,
    targetMetric: MetricId,
  ): { withData: DemographicGroup[]; noData: DemographicGroup[] } {
    const withData: DemographicGroup[] = []
    const noData: DemographicGroup[] = []

    if (this.isFieldMissing(fieldName)) return { withData, noData }

    const validRows = this.getValidRowsForField(fieldName)
    const groupOptions = new Set<DemographicGroup>(
      validRows.map((row) => row[fieldName]),
    )

    groupOptions.forEach((group) => {
      const validRowsPerGroup = validRows.filter((row) => {
        return row[fieldName] === group
      })
      validRowsPerGroup.some((row) => {
        // exclude null and undefined, include any values including 0
        return (
          !isNaN(Number.parseFloat(row[targetMetric])) &&
          row[targetMetric] != null
        )
      })
        ? withData.push(group)
        : noData.push(group)
    })

    return {
      withData,
      noData,
    }
  }

  // Returns true if any of requested fields are missing or failure occurred
  shouldShowMissingDataMessage(fields: MetricId[]): boolean {
    return (
      this.dataIsMissing() || fields.some((field) => this.isFieldMissing(field))
    )
  }
}

// wraps around each provider's getDatasetId and getFallbackAllsDatasetId functions and returns the resolved datasetId and whether that id is an ALLS fallback
export function resolveDatasetId(
  metricQuery: MetricQuery,
  getDatasetId: (
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ) => DatasetId | undefined,
  getFallbackAllsDatasetId?: (
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ) => DatasetId | undefined,
): {
  datasetId: DatasetId | undefined
  breakdowns: Breakdowns
  useFallback: boolean
} {
  const { breakdowns, scrollToHashId, timeView } = metricQuery
  const breakdownDatasetId = getDatasetId(breakdowns, undefined, timeView)

  const shouldFallBackToAlls = Boolean(
    scrollToHashId &&
      CARDS_THAT_SHOULD_FALLBACK_TO_ALLS.includes(scrollToHashId) &&
      breakdownDatasetId === undefined,
  )

  const fallbackAllsDatasetId = shouldFallBackToAlls
    ? getFallbackAllsDatasetId?.(breakdowns, undefined, timeView)
    : undefined

  return {
    datasetId: breakdownDatasetId || fallbackAllsDatasetId,
    breakdowns,
    useFallback: Boolean(fallbackAllsDatasetId),
  }
}
