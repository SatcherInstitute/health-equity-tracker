import { Breakdowns } from "./Breakdowns";
import { JoinType } from "./datasetutils";
import { MetricId } from "./variableProviders";
import { Row } from "./DatasetTypes";

export class MetricQuery {
  readonly varIds: MetricId[];
  readonly breakdowns: Breakdowns;
  readonly joinType: JoinType;

  constructor(
    varIds: MetricId | MetricId[],
    breakdowns: Breakdowns,
    joinType?: JoinType
  ) {
    this.varIds = [varIds].flat();
    this.breakdowns = breakdowns;
    this.joinType = joinType || "left";
  }

  getUniqueKey(): string {
    return this.varIds.join(",") + ":____:" + this.breakdowns.getUniqueKey();
  }
}

export class ExpectedError extends Error {}

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

export class MetricQueryResponse {
  readonly data: Row[];
  readonly error?: ExpectedError;
  readonly invalidValues: Record<string, number>;

  constructor(input: Row[] | ExpectedError) {
    if (input instanceof Error) {
      this.error = input as Error;
      this.data = [];
      this.invalidValues = {};
    } else {
      this.data = input as Row[];
      // TODO - it may be more efficient to calcluate this in the provider
      this.invalidValues = getInvalidValues(this.data);
    }
  }

  isError(): boolean {
    return !!this.error;
  }

  isFieldMissing(fieldName: string): boolean {
    return this.invalidValues[fieldName] === this.data.length;
  }

  // Returns true if any of requested fields are missing or an error is present
  shouldShowError(fields: string[]): boolean {
    return (
      fields.some((field: string) => this.isFieldMissing(field)) ||
      this.isError()
    );
  }
}
