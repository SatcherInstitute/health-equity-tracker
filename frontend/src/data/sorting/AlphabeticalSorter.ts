import { Breakdowns } from "../query/Breakdowns";
import { Row } from "../utils/DatasetTypes";
import { AbstractDataSorter } from "./AbstractDataSorter";

export class AlphabeticalSorter extends AbstractDataSorter {
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
    // We Reverse these becauase we want the human readable version of sorting.
    // eg. [A, B, C] to work with the index calculation. so that A is first and B is
    // second ... ect
    this.frontValues = frontValues.reverse();
    this.backValues = backValues;
  }

  checkShouldSort = (b: Breakdowns) => {
    return !!b.hasOneRegionOfGeographicGranularity();
  };

  sort = (l: Row, r: Row) => {
    let l_val = l[this.reorderCol];
    let r_val = r[this.reorderCol];

    let front_left = this.frontValues.indexOf(l_val);
    let front_right = this.frontValues.indexOf(r_val);

    let diff = front_right - front_left;

    if (diff !== 0) {
      return diff;
    }

    let back_left = this.backValues.indexOf(l_val);
    let back_right = this.backValues.indexOf(r_val);

    diff = back_left - back_right;

    if (diff !== 0) {
      return diff;
    }

    return l[this.reorderCol].localeCompare(r[this.reorderCol]);
  };
}
