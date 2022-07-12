import { Breakdowns, BreakdownVar } from "./Breakdowns";
import { Row, FieldRange } from "../utils/DatasetTypes";
import { MetricId } from "../config/MetricConfig";
import { DemographicGroup } from "../utils/Constants";

export class MetricQuery {
  readonly metricIds: MetricId[];
  readonly breakdowns: Breakdowns;

  constructor(metricIds: MetricId | MetricId[], breakdowns: Breakdowns) {
    this.metricIds = [metricIds].flat();
    this.breakdowns = breakdowns;
  }

  getUniqueKey(): string {
    return this.metricIds.join(",") + ":____:" + this.breakdowns.getUniqueKey();
  }
}

function getInvalidValues(rows: Row[]) {
  let invalidValues: Record<string, number> = {};
  rows.forEach((row: Row) => {
    Object.entries(row).forEach(([fieldName, value]) => {
      if (value === undefined || value === null) {
        const currentValue = invalidValues[fieldName] || 0;
        invalidValues[fieldName] = currentValue + 1;
      }
    });
  });
  return invalidValues;
}

export function createMissingDataResponse(missingDataMessage: string) {
  return new MetricQueryResponse(
    [],
    /*consumedDatasetIds=*/ [],
    missingDataMessage
  );
}

export class MetricQueryResponse {
  readonly data: Row[];
  readonly missingDataMessage: string | undefined;
  readonly invalidValues: Record<string, number>;
  readonly consumedDatasetIds: string[];

  constructor(
    data: Row[],
    consumedDatasetIds: string[] = [],
    missingDataMessage: string | undefined = undefined
  ) {
    this.data = data;
    this.consumedDatasetIds = consumedDatasetIds;
    this.invalidValues = getInvalidValues(this.data);
    this.missingDataMessage = missingDataMessage; // possibly undefined
    if (this.missingDataMessage === undefined && this.data.length <= 0) {
      this.missingDataMessage = "No rows returned";
    }
  }

  dataIsMissing(): boolean {
    return this.missingDataMessage !== undefined;
  }

  isFieldMissing(fieldName: BreakdownVar | MetricId): boolean {
    return this.invalidValues[fieldName] === this.data.length;
  }

  // Calculate numerical range for a field or return undefined if not applicable
  getFieldRange(fieldName: MetricId): FieldRange | undefined {
    const fieldValues = this.data
      .filter((row) => !isNaN(row[fieldName]))
      .map((row) => row[fieldName]);
    if (fieldValues.length === 0) {
      return undefined;
    }
    return {
      min: Math.min(...fieldValues),
      max: Math.max(...fieldValues),
    };
  }

  // Filters rows to those for which the requested field has a valid value
  getValidRowsForField(fieldName: BreakdownVar | MetricId) {
    return this.data.filter(
      (row: Row) => row[fieldName] !== undefined && row[fieldName] !== null
    );
  }

  //! Is this method ever used?
  getValidRowsForFields(fieldNames: BreakdownVar[] | MetricId[]) {
    let data = this.data;
    fieldNames.forEach((name: BreakdownVar | MetricId) => {
      data = this.getValidRowsForField(name);
    });
    return data;
  }

  // Generate two arrays of demographic groups, with and without data in the target metric field
  getFieldValues(
    fieldName: BreakdownVar,
    targetMetric: MetricId
  ): { withData: DemographicGroup[]; noData: DemographicGroup[] } {
    const withData: DemographicGroup[] = [];
    const noData: DemographicGroup[] = [];

    if (this.isFieldMissing(fieldName)) return { withData, noData };

    const validRows = this.getValidRowsForField(fieldName);
    const groupOptions = new Set<DemographicGroup>(
      validRows.map((row) => row[fieldName])
    );

    groupOptions.forEach((group) => {
      const validRowsPerGroup = validRows.filter((row) => {
        return row[fieldName] === group;
      });
      validRowsPerGroup.some((row) => {
        // exclude null and undefined, include any values including 0
        return (
          !isNaN(parseFloat(row[targetMetric])) && row[targetMetric] != null
        );
      })
        ? withData.push(group)
        : noData.push(group);
    });

    return {
      withData,
      noData,
    };
  }

  // Returns true if any of requested fields are missing or failure occurred
  shouldShowMissingDataMessage(fields: MetricId[]): boolean {
    return (
      this.dataIsMissing() || fields.some((field) => this.isFieldMissing(field))
    );
  }
}
