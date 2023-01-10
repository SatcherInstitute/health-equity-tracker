import { Breakdowns } from "../query/Breakdowns";
import { ALL, UNKNOWN, UNKNOWN_HL } from "../utils/Constants";
import { Row } from "../utils/DatasetTypes";
import { AbstractSortStrategy } from "./AbstractDataSorter";
import { AgeSorterStrategy } from "./AgeSorterStrategy";
import { AlphabeticalSorterStrategy } from "./AlphabeticalSorterStrategy";

export class DatasetOrganizer {
  reorderingColumn: string;
  breakdowns: Breakdowns;
  data: Row[] | string[];
  sortStrategies: AbstractSortStrategy[];

  /*
    data : Data to be sorted (in place)
    breakdowns : current breakdown config
    valuesToFront: values to bring to the front in left to right being the frontmost
    valuesToBack: values to bring to the back in left to right being the frontmost
=  */
  constructor(
    data: Row[] | string[],
    breakdowns: Breakdowns,
    valuesToFront = [ALL],
    valuesToBack = [UNKNOWN, UNKNOWN_HL]
  ) {
    this.breakdowns = breakdowns;
    this.data = data;
    // if there isn't a demographic breakdown column to sort on (like in GeoContext), instead sort on the FIPS column
    this.reorderingColumn = breakdowns.hasNoDemographicBreakdown()
      ? "fips"
      : breakdowns.getSoleDemographicBreakdown().columnName;
    this.sortStrategies = [
      new AlphabeticalSorterStrategy(
        this.reorderingColumn,
        valuesToFront,
        valuesToBack
      ),
      new AgeSorterStrategy(valuesToFront, valuesToBack),
    ];
  }

  organize() {
    for (const strategy of this.sortStrategies) {
      if (strategy.appliesToBreakdowns(this.breakdowns)) {
        this.data.sort(strategy.compareFn);
        return;
      }
    }
  }
}
