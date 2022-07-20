import { Breakdowns } from "../query/Breakdowns";
import { Row } from "../utils/DatasetTypes";
import { AbstractSortStrategy } from "./AbstractDataSorter";

export class AgeSorterStrategy extends AbstractSortStrategy {
  frontValues: string[];
  backValues: string[];

  appliesToBreakdowns = (b: Breakdowns) => {
    return b.hasOnlyAge();
  };

  constructor(frontValues: string[] = [], backValues: string[] = []) {
    super();
    // We Reverse these because we want the human readable version of sorting.
    // eg. [A, B, C] to work with the index calculation. so that A is first and B is
    // second ... ect
    this.frontValues = frontValues.reverse();
    this.backValues = backValues;
  }

  readonly compareFn = (l: Row | string, r: Row | string) => {
    const lAge = typeof l === "string" ? l : l["age"];
    const rAge = typeof r === "string" ? r : r["age"]; //Rage hehe

    const front_left = this.frontValues.indexOf(lAge);
    const front_right = this.frontValues.indexOf(rAge);

    let diff = front_right - front_left;

    if (diff !== 0) {
      return diff;
    }

    const back_left = this.backValues.indexOf(lAge);
    const back_right = this.backValues.indexOf(rAge);

    diff = back_left - back_right;
    if (diff !== 0) {
      return diff;
    }

    const leftUnbounded = lAge.includes("+");
    const rightUnbounded = rAge.includes("+");

    if (leftUnbounded && rightUnbounded) {
      return 0;
    } else if (leftUnbounded) {
      return 1;
    } else if (rightUnbounded) {
      return -1;
    }

    const lMin = lAge.split("-")[0];
    const rMin = rAge.split("-")[0];
    return Number(lMin) - Number(rMin);
  };
}
