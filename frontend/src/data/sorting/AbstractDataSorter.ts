import { Breakdowns } from "../query/Breakdowns";
import { Row } from "../utils/DatasetTypes";

export abstract class AbstractSortStrategy {
  abstract appliesToBreakdowns: (b: Breakdowns) => boolean;
  abstract compareFn: (l: Row | string, d: Row | string) => number;
}
