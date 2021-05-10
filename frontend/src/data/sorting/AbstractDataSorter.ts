import { Breakdowns } from "../query/Breakdowns";
import { Row } from "../utils/DatasetTypes";

export abstract class AbstractDataSorter {
  abstract checkShouldSort: (b: Breakdowns) => boolean;
  abstract sort: (l: Row, d: Row) => number;

  public checkApply(data: Row[], breakdown: Breakdowns) {
    if (this.checkShouldSort(breakdown)) {
      data.sort(this.sort);
    }
  }
}
