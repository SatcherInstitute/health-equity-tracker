import { getDataManager } from "../../utils/globals";
import { MetricId, VariableId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";
import {
  UNKNOWN_RACE,
  HISPANIC,
  MULTI,
  MULTI_OR_OTHER_STANDARD,
} from "../utils/Constants";

class CdcSviProvider extends VariableProvider {
  constructor() {
    super("cdc_svi_provider", ["cdc_svi"]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return "cdc_svi_data-county";
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const cdc_svi = await getDataManager().loadDataset(datasetId);
    let df = cdc_svi.toDataFrame();

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    let consumedDatasetIds = [datasetId];

    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.geography === "county";
  }
}

export default CdcSviProvider;
