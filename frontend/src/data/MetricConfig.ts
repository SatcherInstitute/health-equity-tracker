import { MetricId } from "../data/variableProviders";

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

// TODO - strongly type key
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
        },
        pct_share: {
          metricId: "covid_cases_pct_of_geo",
          fullCardTitleName: "Share of COVID-19 cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
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
        },
        pct_share: {
          metricId: "covid_deaths_pct_of_geo",
          fullCardTitleName: "Share of COVID-19 deaths",
          shortVegaLabel: "% of deaths",
          type: "pct_share",
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
        },
        pct_share: {
          metricId: "covid_hosp_pct_of_geo",
          fullCardTitleName: "Share of COVID-19 hospitalizations",
          shortVegaLabel: "% of hospitalizations",
          type: "pct_share",
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
