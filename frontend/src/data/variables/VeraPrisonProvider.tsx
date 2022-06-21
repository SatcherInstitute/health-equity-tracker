// import { getDataManager } from "../../utils/globals";
// import { Breakdowns } from "../query/Breakdowns";
// import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
// import { PRISON_METRICS } from "./BjsProvider";
// import VariableProvider from "./VariableProvider";

// class VeraPrisonProvider extends VariableProvider {
//   constructor() {
//     super("vera_prison_provider", ["vera_population_pct", ...PRISON_METRICS]);
//   }

//   getDatasetId(breakdowns: Breakdowns): string {

//     return (
//       "vera_incarceration_data-prison_" +
//       breakdowns.getSoleDemographicBreakdown().columnName +
//       "_" +
//       breakdowns.geography
//     );
//   }

//   async getDataInternal(
//     metricQuery: MetricQuery
//   ): Promise<MetricQueryResponse> {
//     const breakdowns = metricQuery.breakdowns;
//     const datasetId = this.getDatasetId(breakdowns);
//     const vera = await getDataManager().loadDataset(datasetId);
//     let df = vera.toDataFrame();

//     df = this.filterByGeo(df, breakdowns);

//     df = this.renameGeoColumns(df, breakdowns);

//     let consumedDatasetIds = [datasetId];

//     df = this.applyDemographicBreakdownFilters(df, breakdowns);
//     df = this.removeUnrequestedColumns(df, metricQuery);

//     return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
//   }

//   allowsBreakdowns(breakdowns: Breakdowns): boolean {
//     const validDemographicBreakdownRequest =
//       !breakdowns.time && breakdowns.hasExactlyOneDemographic();

//     return (
//       breakdowns.geography === "county" && validDemographicBreakdownRequest
//     );
//   }
// }

// export default VeraPrisonProvider;
export {};
