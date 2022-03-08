import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { MetricId } from "../config/MetricConfig";
import { excludeAll } from "../query/BreakdownFilter";

export interface FipsSpec {
  code: string;
  name: string;
}
export const CHATAM: FipsSpec = {
  code: "37037",
  name: "Chatam County",
};
export const DURHAM: FipsSpec = {
  code: "37063",
  name: "Durham County",
};
export const NC: FipsSpec = {
  code: "37",
  name: "North Carolina",
};
export const AL: FipsSpec = {
  code: "01",
  name: "Alabama",
};
export const CA: FipsSpec = {
  code: "06",
  name: "California",
};
export const MARIN: FipsSpec = {
  code: "06041",
  name: "Marin County",
};
export const WA: FipsSpec = {
  code: "53",
  name: "Washington",
};
export const VI: FipsSpec = {
  code: "78",
  name: "Virgin Islands",
};
export const USA: FipsSpec = {
  code: USA_FIPS,
  name: USA_DISPLAY_NAME,
};

export function createWithAndWithoutAllEvaluator(
  metricIds: MetricId | MetricId[],
  dataFetcher: FakeDataFetcher,
  variableProvider: VariableProvider
) {
  return async (
    datasetId: string,
    rawData: any[],
    baseBreakdown: Breakdowns,
    breakdownVar: BreakdownVar,
    rowsExcludingAll: any[],
    rowsIncludingAll: any[]
  ) => {
    dataFetcher.setFakeDatasetLoaded(datasetId, rawData);

    // Evaluate the response with requesting "All" field
    const responseWithAll = await variableProvider.getData(
      new MetricQuery(metricIds, baseBreakdown.addBreakdown(breakdownVar))
    );
    expect(responseWithAll).toEqual(
      new MetricQueryResponse(rowsIncludingAll, [datasetId])
    );

    // Evaluate the response without requesting "All" field
    const responseWithoutAll = await variableProvider.getData(
      new MetricQuery(
        metricIds,
        baseBreakdown.addBreakdown(breakdownVar, excludeAll())
      )
    );
    expect(responseWithoutAll).toEqual(
      new MetricQueryResponse(rowsExcludingAll, [datasetId])
    );
  };
}
