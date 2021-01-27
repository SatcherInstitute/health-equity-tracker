import { Breakdowns } from "./Breakdowns";
import { JoinType } from "./datasetutils";
import { Row } from "./DatasetTypes";
import { MetricId } from "./MetricConfig";

export class MetricQuery {
  readonly metricIds: MetricId[];
  readonly breakdowns: Breakdowns;
  readonly joinType: JoinType;

  constructor(
    metricIds: MetricId | MetricId[],
    breakdowns: Breakdowns,
    joinType?: JoinType
  ) {
    this.metricIds = [metricIds].flat();
    this.breakdowns = breakdowns;
    this.joinType = joinType || "left";
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
    dataRows: Row[],
    consumedDatasetIds: string[] = [],
    missingDataMessage: string | undefined = undefined
  ) {
    this.data = dataRows;
    this.consumedDatasetIds = consumedDatasetIds;
    this.invalidValues = getInvalidValues(this.data);
    this.missingDataMessage = missingDataMessage; // possibily undefined
    if (this.missingDataMessage === undefined && this.data.length <= 0) {
      this.missingDataMessage = "No rows returned";
    }
  }

  dataIsMissing(): boolean {
    return this.missingDataMessage !== undefined;
  }

  isFieldMissing(fieldName: string): boolean {
    return this.invalidValues[fieldName] === this.data.length;
  }

  getUniqueFieldValues(fieldName: string): string[] {
    if (this.isFieldMissing(fieldName)) {
      return [];
    }
    const set = new Set<string>();
    this.data.forEach((row) => {
      set.add(row[fieldName]);
    });
    return Array.from(set);
  }

  // Returns true if any of requested fields are missing or failure occurred
  shouldShowMissingDataMessage(fields: string[]): boolean {
    return (
      this.dataIsMissing() ||
      fields.some((field: string) => this.isFieldMissing(field))
    );
  }
}
