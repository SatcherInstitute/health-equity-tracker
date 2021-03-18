export type MetricId =
  | "population"
  | "population_pct"
  | "diabetes_count"
  | "diabetes_per_100k"
  | "diabetes_pct_share"
  | "copd_count"
  | "copd_per_100k"
  | "copd_pct_share"
  | "covid_cases"
  | "covid_deaths"
  | "covid_hosp"
  | "covid_cases_pct_of_geo"
  | "covid_deaths_pct_of_geo"
  | "covid_hosp_pct_of_geo"
  | "covid_deaths_per_100k"
  | "covid_cases_per_100k"
  | "covid_hosp_per_100k"
  | "covid_cases_reporting_population"
  | "covid_cases_reporting_population_pct"
  | "covid_deaths_reporting_population"
  | "covid_deaths_reporting_population_pct"
  | "covid_hosp_reporting_population"
  | "covid_hosp_reporting_population_pct";

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
};

export type VariableConfig = {
  variableId: string; // TODO - strongly type key
  variableDisplayName: string;
  metrics: Record<string, MetricConfig>; // TODO - strongly type key
};

export const POPULATION_VARIABLE_CONFIG: VariableConfig = {
  variableId: "population",
  variableDisplayName: "Population",
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
      metrics: {
        count: {
          metricId: "covid_cases",
          fullCardTitleName: "COVID-19 cases",
          shortVegaLabel: "COVID-19 cases",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_cases_reporting_population",
            fullCardTitleName: "Reporting Population",
            shortVegaLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_cases_pct_of_geo",
          fullCardTitleName: "Share of COVID-19 cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_cases_reporting_population_pct",
            fullCardTitleName: "Reporting Population Share",
            shortVegaLabel: "% of reporting population",
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
      metrics: {
        count: {
          metricId: "covid_deaths",
          fullCardTitleName: "COVID-19 deaths",
          shortVegaLabel: "Deaths",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_deaths_reporting_population",
            fullCardTitleName: "Reporting Population",
            shortVegaLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_deaths_pct_of_geo",
          fullCardTitleName: "Share of COVID-19 deaths",
          shortVegaLabel: "% of deaths",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_deaths_reporting_population_pct",
            fullCardTitleName: "Reporting Population Share",
            shortVegaLabel: "% of reporting population",
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
      metrics: {
        count: {
          metricId: "covid_hosp",
          fullCardTitleName: "COVID-19 hospitalizations",
          shortVegaLabel: "Hospitalizations",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_hosp_reporting_population",
            fullCardTitleName: "Reporting Population",
            shortVegaLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_hosp_pct_of_geo",
          fullCardTitleName: "Share of COVID-19 hospitalizations",
          shortVegaLabel: "% of hospitalizations",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_hosp_reporting_population_pct",
            fullCardTitleName: "Reporting Population Share",
            shortVegaLabel: "% of reporting population",
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
      metrics: {
        count: {
          metricId: "diabetes_count",
          fullCardTitleName: "Count of diabetes cases",
          shortVegaLabel: "Diabetes cases",
          type: "count",
          populationComparisonMetric: POPULATION_VARIABLE_CONFIG.metrics.count,
        },
        pct_share: {
          metricId: "diabetes_pct_share",
          fullCardTitleName: "Share of Diabetes cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric:
            POPULATION_VARIABLE_CONFIG.metrics.pct_share,
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
      metrics: {
        count: {
          metricId: "copd_count",
          fullCardTitleName: "Count of COPD cases",
          shortVegaLabel: "COPD cases",
          type: "count",
          populationComparisonMetric: POPULATION_VARIABLE_CONFIG.metrics.count,
        },
        pct_share: {
          metricId: "copd_pct_share",
          fullCardTitleName: "Share of COPD cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric:
            POPULATION_VARIABLE_CONFIG.metrics.pct_share,
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
};
