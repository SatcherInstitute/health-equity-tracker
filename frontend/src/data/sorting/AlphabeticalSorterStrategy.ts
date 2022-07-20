import { Breakdowns } from "../query/Breakdowns";
import { Row } from "../utils/DatasetTypes";
import { AbstractSortStrategy } from "./AbstractDataSorter";

export class AlphabeticalSorterStrategy extends AbstractSortStrategy {
  reorderCol: string;
  frontValues: string[];
  backValues: string[];

  constructor(
    reorderCol: string,
    frontValues: string[] = [],
    backValues: string[] = []
  ) {
    super();
    this.reorderCol = reorderCol;
    // We Reverse these because we want the human readable version of sorting.
    // eg. [A, B, C] to work with the index calculation. so that A is first and B is
    // second ... ect
    this.frontValues = frontValues.reverse();
    this.backValues = backValues;
  }

  appliesToBreakdowns = (b: Breakdowns) => {
    return !b.hasOnlyAge() && b.hasOneRegionOfGeographicGranularity();
  };

  compareFn = (l: Row | string, r: Row | string) => {
    const l_val = typeof l === "string" ? l : l[this.reorderCol];
    const r_val = typeof r === "string" ? r : r[this.reorderCol];

    const front_left = this.frontValues.indexOf(l_val);
    const front_right = this.frontValues.indexOf(r_val);

    let diff = front_right - front_left;

    if (diff !== 0) {
      return diff;
    }

    const back_left = this.backValues.indexOf(l_val);
    const back_right = this.backValues.indexOf(r_val);

    diff = back_left - back_right;

    if (diff !== 0) {
      return diff;
    }

    return l_val.localeCompare(r_val);
  };
}
