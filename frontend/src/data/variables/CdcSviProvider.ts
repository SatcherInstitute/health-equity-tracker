import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import VariableProvider from "./VariableProvider";

class CdcSviProvider extends VariableProvider {
  constructor() {
    super("cdc_svi_provider", ["svi"]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return "cdc_svi_county-age";
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const timeView = metricQuery.timeView;
    const datasetId = this.getDatasetId(breakdowns);
    const cdc_svi = await getDataManager().loadDataset(datasetId);

    let df = cdc_svi.toDataFrame();

    df = this.filterByGeo(df, breakdowns);
    df = this.filterByTimeView(df, timeView);
    df = this.renameGeoColumns(df, breakdowns);

    let consumedDatasetIds = [datasetId];

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest = !breakdowns.time;

    return (
      validDemographicBreakdownRequest && breakdowns.geography === "county"
    );
  }
}

export default CdcSviProvider;
