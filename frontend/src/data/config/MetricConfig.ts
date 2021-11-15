export type MetricId =
  | "brfss_population_pct"
  | "copd_pct"
  | "copd_pct_share"
  | "copd_per_100k"
  | "covid_cases"
  | "covid_cases_per_100k"
  | "covid_cases_reporting_population"
  | "covid_cases_reporting_population_pct"
  | "covid_cases_share"
  | "covid_cases_share_of_known"
  | "covid_deaths"
  | "covid_deaths_per_100k"
  | "covid_deaths_reporting_population"
  | "covid_deaths_reporting_population_pct"
  | "covid_deaths_share"
  | "covid_deaths_share_of_known"
  | "covid_hosp"
  | "covid_hosp_per_100k"
  | "covid_hosp_reporting_population"
  | "covid_hosp_reporting_population_pct"
  | "covid_hosp_share"
  | "covid_hosp_share_of_known"
  | "diabetes_pct"
  | "diabetes_pct_share"
  | "diabetes_per_100k"
  | "health_insurance_count"
  | "health_insurance_pct_share"
  | "health_insurance_per_100k"
  | "health_insurance_population_pct"
  | "population"
  | "population_pct"
  | "population_2010"
  | "population_pct_2010"
  | "poverty_count"
  | "poverty_pct_share"
  | "poverty_per_100k"
  | "poverty_population_pct"
  | "vaccinated_pct_share"
  | "vaccinated_share_of_known"
  | "vaccinated_per_100k"
  | "vaccine_population_pct"
  | "acs_vaccine_population_pct";

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
  unknownsVegaLabel?: string;
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
  surveyCollectedData?: boolean;
};

const populationPctTitle = "Population Share";
const populationPctShortLabel = "% of population";

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
      fullCardTitleName: populationPctTitle,
      shortVegaLabel: populationPctShortLabel,
      type: "pct_share",
    },
  },
};

export const POPULATION_VARIABLE_CONFIG_2010: VariableConfig = {
  variableId: "population_2010",
  variableDisplayName: "Population",
  variableFullDisplayName: "Population",
  metrics: {
    count: {
      metricId: "population_2010",
      fullCardTitleName: "Population",
      shortVegaLabel: "people",
      type: "count",
    },
    pct_share: {
      metricId: "population_pct_2010",
      fullCardTitleName: populationPctTitle,
      shortVegaLabel: populationPctShortLabel,
      type: "pct_share",
    },
  },
};

/**
 * @param metricType The type of the metric to format.
 * @param value The value to format.
 * @param omitPctSymbol Whether to omit the % symbol if the metric is a %. This
 *     can be used for example if the % symbol is part of the description.
 * @returns A formatted version of a field value based on the type specified by
 *     the field name
 */
export function formatFieldValue(
  metricType: MetricType,
  value: any,
  omitPctSymbol: boolean = false
): string {
  if (value === null || value === undefined) {
    return "";
  }
  const isPctShare = metricType === "pct_share";
  const formatOptions = isPctShare ? { minimumFractionDigits: 1 } : {};
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en", formatOptions)
      : value;
  const suffix = isPctShare && !omitPctSymbol ? "%" : "";
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

// Note: metrics must be declared in a consistent order because the UI relies
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
          fullCardTitleName: "COVID-19 Cases",
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
          fullCardTitleName: "Share Of Total COVID-19 Cases",
          unknownsVegaLabel: "% unknown",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_cases_reporting_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_cases_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Cases",
            shortVegaLabel: "% of cases",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_cases_per_100k",
          fullCardTitleName: "COVID-19 Cases Per 100K People",
          shortVegaLabel: "cases per 100K",
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
          fullCardTitleName: "COVID-19 Deaths",
          shortVegaLabel: "COVID-19 Deaths",
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
          fullCardTitleName: "Share Of Total COVID-19 Deaths",
          shortVegaLabel: "% of deaths",
          unknownsVegaLabel: "% unknown",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_deaths_reporting_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_deaths_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Deaths",
            shortVegaLabel: "% of deaths",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_deaths_per_100k",
          fullCardTitleName: "COVID-19 Deaths Per 100K People",
          shortVegaLabel: "deaths per 100K",
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
          fullCardTitleName: "COVID-19 Hospitalizations",
          shortVegaLabel: "COVID-19 hospitalizations",
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
          fullCardTitleName: "Share Of Total COVID-19 Hospitalizations",
          shortVegaLabel: "% of hospitalizations",
          unknownsVegaLabel: "% unknown",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_hosp_reporting_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_hosp_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Hospitalizations",
            shortVegaLabel: "% of hospitalizations",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_hosp_per_100k",
          fullCardTitleName: "COVID-19 Hospitalizations Per 100K People",
          shortVegaLabel: "hospitalizations per 100K",
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
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "diabetes_pct_share",
          fullCardTitleName: "Share Of Total Diabetes Cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "diabetes_per_100k",
          fullCardTitleName: "Diabetes Cases Per 100K People",
          shortVegaLabel: "diabetes cases per 100K",
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
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "copd_pct_share",
          fullCardTitleName: "Share Of Total COPD Cases",
          shortVegaLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "copd_per_100k",
          fullCardTitleName: "COPD Cases Per 100K People",
          shortVegaLabel: "COPD cases per 100K",
          type: "per100k",
        },
      },
    },
  ],
  health_insurance: [
    {
      variableId: "health_coverage",
      variableDisplayName: "Uninsured Individuals",
      variableFullDisplayName: "Uninsured Individuals",
      metrics: {
        per100k: {
          metricId: "health_insurance_per_100k",
          fullCardTitleName: "Uninsured Individuals Per 100K People",
          shortVegaLabel: "uninsured individuals per 100K",
          type: "per100k",
        },
        pct_share: {
          metricId: "health_insurance_pct_share",
          fullCardTitleName: "Share Of Uninsured Individuals",
          shortVegaLabel: "% of uninsured",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "health_insurance_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
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
      variableFullDisplayName: "Individuals Below The Poverty Line",
      metrics: {
        per100k: {
          metricId: "poverty_per_100k",
          fullCardTitleName:
            "Individuals Below The Poverty Line Per 100K People",
          shortVegaLabel: "individuals below the poverty line per 100K",
          type: "per100k",
        },
        pct_share: {
          metricId: "poverty_pct_share",
          fullCardTitleName: "Share Of Poverty",
          shortVegaLabel: "% of impoverished",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "poverty_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
      },
    },
  ],
  vaccinations: [
    {
      variableId: "vaccinations",
      variableDisplayName: "Vaccinations",
      variableFullDisplayName: "COVID-19 Vaccinations",
      metrics: {
        per100k: {
          metricId: "vaccinated_per_100k",
          fullCardTitleName: "COVID-19 Vaccinations Per 100K People",
          shortVegaLabel: "COVID-19 vaccinations per 100K",
          type: "per100k",
        },
        pct_share: {
          metricId: "vaccinated_pct_share",
          fullCardTitleName: "Share Of Total COVID-19 Vaccinations",
          unknownsVegaLabel: "% unknown",
          shortVegaLabel: "% of vaccinations",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "vaccine_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "vaccinated_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Vaccinations",
            shortVegaLabel: "% of COVID-19 vaccinations",
            type: "pct_share",
          },
        },
      },
    },
  ],
};
