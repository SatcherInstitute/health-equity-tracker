import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";

export const UHC_DETERMINANTS: MetricId[] = [
  "brfss_population_pct",
  "copd_pct_share",
  "copd_per_100k",
  "copd_ratio_age_adjusted",
  "diabetes_pct_share",
  "diabetes_per_100k",
  "diabetes_ratio_age_adjusted",
  "depression_pct_share",
  "depression_per_100k",
  "depression_ratio_age_adjusted",
  "illicit_opioid_use_pct_share",
  "illicit_opioid_use_per_100k",
  "illicit_opioid_use_ratio_age_adjusted",
  "non_medical_rx_opioid_use_pct_share",
  "non_medical_rx_opioid_use_per_100k",
  "non_medical_rx_opioid_use_ratio_age_adjusted",
  "non_medical_drug_use_ratio_age_adjusted",
  "non_medical_drug_use_pct_share",
  "non_medical_drug_use_per_100k",
  "excessive_drinking_pct_share",
  "excessive_drinking_per_100k",
  "excessive_drinking_ratio_age_adjusted",
  "frequent_mental_distress_pct_share",
  "frequent_mental_distress_per_100k",
  "frequent_mental_distress_ratio_age_adjusted",
  "preventable_hospitalizations_pct_share",
  "preventable_hospitalizations_per_100k",
  "preventable_hospitalizations_ratio_age_adjusted",
  "avoided_care_pct_share",
  "avoided_care_per_100k",
  "avoided_care_ratio_age_adjusted",
  "chronic_kidney_disease_pct_share",
  "chronic_kidney_disease_per_100k",
  "chronic_kidney_disease_ratio_age_adjusted",
  "cardiovascular_diseases_pct_share",
  "cardiovascular_diseases_per_100k",
  "cardiovascular_diseases_ratio_age_adjusted",
  "asthma_pct_share",
  "asthma_per_100k",
  "asthma_ratio_age_adjusted",
];

export const UHC_VOTER_AGE_DETERMINANTS: MetricId[] = [
  "voter_participation_pct_share",
  "voter_participation_per_100k",
  "voter_participation_ratio_age_adjusted",
];

export const UHC_DECADE_PLUS_5_AGE_DETERMINANTS: MetricId[] = [
  "suicide_pct_share",
  "suicide_per_100k",
  "suicide_ratio_age_adjusted",
];

export const UHC_API_NH_DETERMINANTS: MetricId[] = [
  "preventable_hospitalizations_pct_share",
  "preventable_hospitalizations_per_100k",
];

export const ALL_UHC_DETERMINANTS = [
  ...UHC_VOTER_AGE_DETERMINANTS,
  ...UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
  ...UHC_DETERMINANTS,
];

class BrfssProvider extends VariableProvider {
  constructor() {
    super("brfss_provider", [
      "brfss_population_pct",
      ...UHC_DETERMINANTS,
      ...UHC_VOTER_AGE_DETERMINANTS,
      ...UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
    ]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return (
      "uhc_data-" +
      breakdowns.getSoleDemographicBreakdown().columnName +
      "_" +
      breakdowns.geography
    );
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const timeView = metricQuery.timeView;
    const datasetId = this.getDatasetId(breakdowns);
    const brfss = await getDataManager().loadDataset(datasetId);
    let df = brfss.toDataFrame();

    const consumedDatasetIds = [datasetId, GetAcsDatasetId(breakdowns)];

    df = this.filterByGeo(df, breakdowns);
    df = this.filterByTimeView(df, timeView, "2021");
    df = this.renameGeoColumns(df, breakdowns);

    df = this.applyDemographicBreakdownFilters(df, breakdowns);

    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic();

    return (
      (breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      validDemographicBreakdownRequest
    );
  }
}

export default BrfssProvider;
