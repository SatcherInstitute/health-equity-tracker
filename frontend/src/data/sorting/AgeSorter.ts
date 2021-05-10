import { Breakdowns } from "../query/Breakdowns";
import { Row } from "../utils/DatasetTypes";
import { AbstractDataSorter } from "./AbstractDataSorter";

export class AgeSorter extends AbstractDataSorter {
  checkShouldSort = (b: Breakdowns) => {
    return b.hasOnlyAge();
  };

  readonly sort = (l: Row, r: Row) => {
    let lAge = l["age"];
    let rAge = r["age"]; //Rage hehe

    if (lAge === "All" && rAge === "All") return 0;
    else if (lAge === "All") return -1;
    else if (rAge === "All") return 1;

    let leftUnbounded = lAge.indexOf("+") !== -1;
    let rightUnbounded = rAge.indexOf("+") !== -1;

    if (leftUnbounded && rightUnbounded) return 0;
    else if (leftUnbounded) return 1;
    else if (rightUnbounded) return -1;

    let lMin = lAge.split("-")[0];
    let rMin = rAge.split("-")[1];
    return Number(lMin) - Number(rMin);
  };
}
