//TODO: Rename to Count
export type MetricId =
  | "population"
  | "population_pct"
  | "diabetes_count"
  | "diabetes_per_100k"
  | "diabetes_pct_share"
  | "copd_count"
  | "copd_per_100k"
  | "copd_pct_share"
  | "brfss_population_pct"
  | "covid_cases"
  | "covid_deaths"
  | "covid_hosp"
  | "covid_cases_share"
  | "covid_deaths_share"
  | "covid_hosp_share"
  | "covid_cases_share_of_known"
  | "covid_deaths_share_of_known"
  | "covid_hosp_share_of_known"
  | "covid_deaths_per_100k"
  | "covid_cases_per_100k"
  | "covid_hosp_per_100k"
  | "covid_cases_reporting_population"
  | "covid_cases_reporting_population_pct"
  | "covid_deaths_reporting_population"
  | "covid_deaths_reporting_population_pct"
  | "covid_hosp_reporting_population"
  | "covid_hosp_reporting_population_pct"
  | "health_insurance_count"
  | "health_insurance_per_100k"
  | "health_insurance_pct_share"
  | "health_insurance_population_pct"
  | "poverty_count"
  | "poverty_per_100k";

// The type of metric indicates where and how this a MetricConfig is represented in the frontend:
// What chart types are applicable, what metrics are shown together, display names, etc.
export type MetricType =
  | "count"
  | "pct_share"
  | "pct_share_to_pop_ratio"
  | "per100k"
  | "percentile"
  | "index";

export type MetricConfig = {
  metricId: MetricId;
  fullCardTitleName: string;
  shortVegaLabel: string;
  type: MetricType;
  populationComparisonMetric?: MetricConfig;

  // This metric is one where the denominator only includes records where
  // demographics are known. For example, for "share of covid cases" in the US
  // for the "Asian" demographic, this metric would be equal to
  // (# of Asian covid cases in the US) divided by
  // (# of covid cases in the US excluding those with unknown race/ethnicity).
  knownBreakdownComparisonMetric?: MetricConfig;
};

export type VariableConfig = {
  variableId: string; // TODO - strongly type key
  variableDisplayName: string;
  variableFullDisplayName: string;
  metrics: Record<string, MetricConfig>; // TODO - strongly type key
};

export const POPULATION_VARIABLE_CONFIG: VariableConfig = {
  variableId: "population",
  variableDisplayName: "Population",
  variableFullDisplayName: "Population",
  metrics: {
    count: {
      metricId: "population",
      fullCardTitleName: "Population",
      shortVegaLabel: "people",
      type: "count",
    },
    pct_share: {
      metricId: "population_pct",
      fullCardTitleName: "Population Share",
      shortVegaLabel: "% of total population",
      type: "pct_share",
    },
  },
};

// Prints a formatted version of a field value based on the type specified by the field name
export function formatFieldValue(metricType: MetricType, value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  const formattedValue =
    typeof value === "number" ? value.toLocaleString("en") : value;
  const suffix = metricType === "pct_share" ? "%" : "";
  return `${formattedValue}${suffix}`;
}

export function getPer100kAndPctShareMetrics(
  variableConfig: VariableConfig
): MetricConfig[] {
  let tableFields: MetricConfig[] = [];
  if (variableConfig) {
    if (variableConfig.metrics["per100k"]) {
      tableFields.push(variableConfig.metrics["per100k"]);
    }
    if (variableConfig.metrics["pct_share"]) {
      tableFields.push(variableConfig.metrics["pct_share"]);
      if (variableConfig.metrics["pct_share"].populationComparisonMetric) {
        tableFields.push(
          variableConfig.metrics["pct_share"].populationComparisonMetric
        );
      }
    }
  }
  return tableFields;
}

// TODO - strongly type key
// TODO - count and pct_share metric types should require populationComparisonMetric

// Note: metrics must be declared in a consistent order becuase the UI relies
// on this to build toggles.
// TODO: make the UI consistent regardless of metric config order.
export const METRIC_CONFIG: Record<string, VariableConfig[]> = {
  covid: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "COVID-19 Cases",
      metrics: {
        count: {
          metricId: "covid_cases",
          fullCardTitleName: "COVID-19 cases",
          shortVegaLabel: "COVID-19 cases",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_cases_reporting_population",
            fullCardTitleName: "Population",
            shortVegaLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_cases_share",
          fullCardTitleName: "Share of total COVID-19 cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_cases_reporting_population_pct",
            fullCardTitleName: "Population Share",
            shortVegaLabel: "% of Population",
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_cases_share_of_known",
            fullCardTitleName:
              "Share of COVID-19 cases with known demographics",
            shortVegaLabel: "% of cases",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_cases_per_100k",
          fullCardTitleName: "COVID-19 cases per 100,000 people",
          shortVegaLabel: "Cases per 100k",
          type: "per100k",
        },
      },
    },
    {
      variableId: "deaths",
      variableDisplayName: "Deaths",
      variableFullDisplayName: "COVID-19 Deaths",
      metrics: {
        count: {
          metricId: "covid_deaths",
          fullCardTitleName: "COVID-19 deaths",
          shortVegaLabel: "Deaths",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_deaths_reporting_population",
            fullCardTitleName: "Population",
            shortVegaLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_deaths_share",
          fullCardTitleName: "Share of total COVID-19 deaths",
          shortVegaLabel: "% of deaths",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_deaths_reporting_population_pct",
            fullCardTitleName: "Population Share",
            shortVegaLabel: "% of Population",
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_deaths_share_of_known",
            fullCardTitleName:
              "Share of COVID-19 deaths with known demographics",
            shortVegaLabel: "% of deaths",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_deaths_per_100k",
          fullCardTitleName: "COVID-19 deaths per 100,000 people",
          shortVegaLabel: "Deaths per 100k",
          type: "per100k",
        },
      },
    },
    {
      variableId: "hospitalizations",
      variableDisplayName: "Hospitalizations",
      variableFullDisplayName: "COVID-19 Hospitalizations",
      metrics: {
        count: {
          metricId: "covid_hosp",
          fullCardTitleName: "COVID-19 hospitalizations",
          shortVegaLabel: "Hospitalizations",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_hosp_reporting_population",
            fullCardTitleName: "Population",
            shortVegaLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_hosp_share",
          fullCardTitleName: "Share of total COVID-19 hospitalizations",
          shortVegaLabel: "% of hospitalizations",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_hosp_reporting_population_pct",
            fullCardTitleName: "Population Share",
            shortVegaLabel: "% of Population",
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_hosp_share_of_known",
            fullCardTitleName:
              "Share of COVID-19 hospitalizations with known demographics",
            shortVegaLabel: "% of hospitalizations",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_hosp_per_100k",
          fullCardTitleName: "COVID-19 hospitalizations per 100,000 people",
          shortVegaLabel: "Hospitalizations per 100k",
          type: "per100k",
        },
      },
    },
  ],
  diabetes: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Diabetes Cases",
      metrics: {
        pct_share: {
          metricId: "diabetes_pct_share",
          fullCardTitleName: "Share of Diabetes cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: "Population Share",
            shortVegaLabel: "% of total population",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "diabetes_per_100k",
          fullCardTitleName: "Diabetes cases per 100,000 people",
          shortVegaLabel: "Diabetes cases per 100k",
          type: "per100k",
        },
      },
    },
  ],
  copd: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "COPD Cases",
      metrics: {
        pct_share: {
          metricId: "copd_pct_share",
          fullCardTitleName: "Share of COPD cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: "Population Share",
            shortVegaLabel: "% of total population",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "copd_per_100k",
          fullCardTitleName: "COPD cases per 100,000 people",
          shortVegaLabel: "COPD cases per 100k",
          type: "per100k",
        },
      },
    },
  ],
  health_insurance: [
    {
      variableId: "health_coverage",
      variableDisplayName: "Uninsured people",
      variableFullDisplayName: "Uninsured people",
      metrics: {
        per100k: {
          metricId: "health_insurance_per_100k",
          fullCardTitleName: "Uninsured individuals per 100,000 people",
          shortVegaLabel: "Uninsured individuals per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "health_insurance_pct_share",
          fullCardTitleName: "Share of uninsured Americans",
          shortVegaLabel: "% of uninsured",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "health_insurance_population_pct",
            fullCardTitleName: "Population Share",
            shortVegaLabel: "% of total population",
            type: "pct_share",
          },
        },
      },
    },
  ],
  poverty: [
    {
      variableId: "poverty",
      variableDisplayName: "Poverty",
      variableFullDisplayName: "Below the poverty level",
      metrics: {
        per100k: {
          metricId: "poverty_per_100k",
          fullCardTitleName:
            "Individuals below the poverty line per 100,000 people",
          shortVegaLabel: "Individuals below the poverty line per 100k",
          type: "per100k",
        },
      },
    },
  ],
};
