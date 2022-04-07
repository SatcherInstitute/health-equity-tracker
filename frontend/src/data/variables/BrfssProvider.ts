import { DataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { exclude } from "../query/BreakdownFilter";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { NON_HISPANIC } from "../utils/Constants";
import { joinOnCols } from "../utils/datasetutils";
import { USA_FIPS } from "../utils/Fips";
import AcsPopulationProvider from "./AcsPopulationProvider";
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

export const UHC_DECADE_PLUS_5_AGE_DETERMINANTS: MetricId[] = [
  "suicide_pct_share",
  "suicide_per_100k",
  "suicide_ratio_age_adjusted",
];

export const UHC_VOTER_AGE_DETERMINANTS: MetricId[] = [
  "voter_participation_pct_share",
  "voter_participation_per_100k",
  "voter_participation_ratio_age_adjusted",
];

export const UHC_API_NH_DETERMINANTS: MetricId[] = [
  "preventable_hospitalizations_pct_share",
  "preventable_hospitalizations_per_100k",
];

class BrfssProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("brfss_provider", [
      "brfss_population_pct",
      ...UHC_DETERMINANTS,
      ...UHC_VOTER_AGE_DETERMINANTS,
      ...UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
    ]);
    this.acsProvider = acsProvider;
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return "uhc_data-" + breakdowns.getSoleDemographicBreakdown().columnName;
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const brfss = await getDataManager().loadDataset(datasetId);
    let df = brfss.toDataFrame();

    const breakdownColumnName =
      breakdowns.getSoleDemographicBreakdown().columnName;

    df = this.filterByGeo(df, breakdowns);

    df = this.renameTotalToAll(df, breakdownColumnName);
    df = this.renameGeoColumns(df, breakdowns);

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;
    acsBreakdowns = acsBreakdowns.addBreakdown(
      breakdownColumnName,
      exclude(NON_HISPANIC)
    );

    if (breakdowns.geography === "national") {
      df = df.where((row) => row.fips === USA_FIPS);
    } else if (breakdowns.geography === "state") {
      df = df.where((row) => row.fips !== USA_FIPS);
    }
    let consumedDatasetIds = [datasetId];

    const acsQueryResponse = await this.acsProvider.getData(
      new MetricQuery(["population", "population_pct"], acsBreakdowns)
    );

    consumedDatasetIds = consumedDatasetIds.concat(
      acsQueryResponse.consumedDatasetIds
    );

    const acs = new DataFrame(acsQueryResponse.data);

    df = joinOnCols(df, acs, ["fips", breakdownColumnName], "left");

    df = df.generateSeries({
      estimated_total_diabetes: (row) =>
        this.calculations.estimateTotal(row.diabetes_per_100k, row.population),
      estimated_total_copd: (row) =>
        this.calculations.estimateTotal(row.copd_per_100k, row.population),
      estimated_total_suicide: (row) =>
        this.calculations.estimateTotal(row.suicide_per_100k, row.population),
      estimated_total_depression: (row) =>
        this.calculations.estimateTotal(
          row.depression_per_100k,
          row.population
        ),
      estimated_total_illicit_opioid_use: (row) =>
        this.calculations.estimateTotal(
          row.illicit_opioid_use_per_100k,
          row.population
        ),
      estimated_total_non_medical_drug_use: (row) =>
        this.calculations.estimateTotal(
          row.non_medical_drug_use_per_100k,
          row.population
        ),
      estimated_total_non_medical_rx_opioid_use: (row) =>
        this.calculations.estimateTotal(
          row.non_medical_rx_opioid_use_per_100k,
          row.population
        ),
      estimated_total_excessive_drinking: (row) =>
        this.calculations.estimateTotal(
          row.excessive_drinking_per_100k,
          row.population
        ),
      estimated_total_frequent_mental_distress: (row) =>
        this.calculations.estimateTotal(
          row.frequent_mental_distress_per_100k,
          row.population
        ),
      estimated_total_preventable_hospitalizations: (row) =>
        this.calculations.estimateTotal(
          row.preventable_hospitalizations_per_100k,
          row.population
        ),
      estimated_total_avoided_care: (row) =>
        this.calculations.estimateTotal(
          row.avoided_care_per_100k,
          row.population
        ),
      estimated_total_chronic_kidney_disease: (row) =>
        this.calculations.estimateTotal(
          row.chronic_kidney_disease_per_100k,
          row.population
        ),
      estimated_total_cardiovascular_diseases: (row) =>
        this.calculations.estimateTotal(
          row.cardiovascular_diseases_per_100k,
          row.population
        ),
      estimated_total_asthma: (row) =>
        this.calculations.estimateTotal(row.asthma_per_100k, row.population),
      estimated_total_voter_participation: (row) =>
        this.calculations.estimateTotal(
          row.voter_participation_per_100k,
          row.population
        ),
    });

    df = df.renameSeries({
      population_pct: "brfss_population_pct",
    });

    // Calculate any share_of_known metrics that may have been requested in the query
    if (this.allowsBreakdowns(breakdowns)) {
      [
        "estimated_total_diabetes",
        "estimated_total_copd",
        "estimated_total_depression",
        "estimated_total_suicide",
        "estimated_total_illicit_opioid_use",
        "estimated_total_non_medical_drug_use",
        "estimated_total_non_medical_rx_opioid_use",
        "estimated_total_excessive_drinking",
        "estimated_total_frequent_mental_distress",
        "estimated_total_preventable_hospitalizations",
        "estimated_total_avoided_care",
        "estimated_total_chronic_kidney_disease",
        "estimated_total_cardiovascular_diseases",
        "estimated_total_asthma",
        "estimated_total_voter_participation",
      ].forEach((col) => {
        df = this.calculations.calculatePctShare(
          df,
          col,
          col.replace("estimated_total_", "") + "_pct_share", // removes prefix & add suffix
          breakdownColumnName,
          ["fips"]
        );
      });
    }

    df = df
      .dropSeries([
        "population",
        "estimated_total_copd",
        "estimated_total_diabetes",
        "estimated_total_depression",
        "estimated_total_suicide",
        "estimated_total_illicit_opioid_use",
        "estimated_total_non_medical_drug_use",
        "estimated_total_non_medical_rx_opioid_use",
        "estimated_total_excessive_drinking",
        "estimated_total_frequent_mental_distress",
        "estimated_total_preventable_hospitalizations",
        "estimated_total_avoided_care",
        "estimated_total_chronic_kidney_disease",
        "estimated_total_cardiovascular_diseases",
        "estimated_total_asthma",
        "estimated_total_voter_participation",
      ])
      .resetIndex();

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
