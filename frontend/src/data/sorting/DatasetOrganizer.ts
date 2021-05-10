import { Breakdowns } from "../query/Breakdowns";
import { ALL, UNKNOWN, UNKNOWN_HL } from "../utils/Constants";
import { Row } from "../utils/DatasetTypes";
import { AbstractDataSorter } from "./AbstractDataSorter";
import { AgeSorter } from "./AgeSorter";
import { AlphabeticalSorter } from "./AlphabeticalSorter";

export class DatasetOrganizer {
  reorderingColumn: string;
  breakdowns: Breakdowns;
  rows: Row[];
  sorters: AbstractDataSorter[];

  constructor(
    rows: Row[],
    breakdowns: Breakdowns,
    valuesToFront = [ALL],
    valuesToBack = [UNKNOWN, UNKNOWN_HL]
  ) {
    this.breakdowns = breakdowns;
    this.rows = rows;
    this.reorderingColumn = breakdowns.getSoleDemographicBreakdown().columnName;
    this.sorters = [
      new AlphabeticalSorter(
        this.reorderingColumn,
        valuesToFront,
        valuesToBack
      ),
      new AgeSorter(),
    ];
  }

  organize() {
    this.sorters.forEach((sorter) => {
      sorter.checkApply(this.rows, this.breakdowns);
    });
  }
}
