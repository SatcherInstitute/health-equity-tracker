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
  readonly dataUnavailableMessage: string | undefined;
  readonly invalidValues: Record<string, number>;

  constructor(input: Row[] | string) {
    if (typeof input === "string") {
      this.dataUnavailableMessage = input as string;
      this.data = [];
      this.invalidValues = {};
    } else if (input.length <= 0) {
      this.dataUnavailableMessage = "No rows returned";
      this.data = [];
      this.invalidValues = {};
    } else {
      this.data = input as Row[];
      // TODO - it may be more efficient to calcluate this in the provider
      this.invalidValues = getInvalidValues(this.data);
    }
  }

  dataIsUnavailable(): boolean {
    return this.dataUnavailableMessage !== undefined;
  }

  isFieldMissing(fieldName: string): boolean {
    return this.invalidValues[fieldName] === this.data.length;
  }

  // Returns true if any of requested fields are missing or failure occurred
  shouldShowMissingDataMessage(fields: string[]): boolean {
    return (
      this.dataIsUnavailable() ||
      fields.some((field: string) => this.isFieldMissing(field))
    );
  }
}
