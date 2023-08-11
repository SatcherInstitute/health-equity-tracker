import {
  type Breakdowns,
  type DemographicType,
  type TimeView,
} from './Breakdowns'
import { type Row, type FieldRange } from '../utils/DatasetTypes'
import { type MetricId, type DataTypeId } from '../config/MetricConfig'
import { type DemographicGroup } from '../utils/Constants'

export class MetricQuery {
  readonly metricIds: MetricId[]
  readonly breakdowns: Breakdowns
  readonly dataTypeId: DataTypeId | undefined
  readonly timeView: TimeView

  constructor(
    metricIds: MetricId | MetricId[],
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView
  ) {
    this.metricIds = [metricIds].flat()
    this.breakdowns = breakdowns
    this.dataTypeId = dataTypeId
    this.timeView = timeView ?? 'cross_sectional'
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

function getInvalidValues(rows: Row[]) {
  const invalidValues: Record<string, number> = {}
  rows.forEach((row: Row) => {
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
    missingDataMessage
  )
}

export class MetricQueryResponse {
  readonly data: Row[]
  readonly missingDataMessage: string | undefined
  readonly invalidValues: Record<string, number>
  readonly consumedDatasetIds: string[]

  constructor(
    data: Row[],
    consumedDatasetIds: string[] = [],
    missingDataMessage: string | undefined = undefined
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
      .filter((row) => !isNaN(row[fieldName]))
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
      (row: Row) => row[fieldName] !== undefined && row[fieldName] !== null
    )
  }

  // Generate two arrays of demographic groups, with and without data in the target metric field
  getFieldValues(
    fieldName: DemographicType,
    targetMetric: MetricId
  ): { withData: DemographicGroup[]; noData: DemographicGroup[] } {
    const withData: DemographicGroup[] = []
    const noData: DemographicGroup[] = []

    if (this.isFieldMissing(fieldName)) return { withData, noData }

    const validRows = this.getValidRowsForField(fieldName)
    const groupOptions = new Set<DemographicGroup>(
      validRows.map((row) => row[fieldName])
    )

    groupOptions.forEach((group) => {
      const validRowsPerGroup = validRows.filter((row) => {
        return row[fieldName] === group
      })
      validRowsPerGroup.some((row) => {
        // exclude null and undefined, include any values including 0
        return (
          !isNaN(parseFloat(row[targetMetric])) && row[targetMetric] != null
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
