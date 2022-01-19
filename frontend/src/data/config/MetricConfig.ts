//  IDs for the selectable conditions in the madlib
export type DropdownVarId =
  | "covid"
  | "diabetes"
  | "copd"
  | "health_insurance"
  | "poverty"
  | "vaccinations"
  | "depression"
  | "suicide"
  | "drug_misuse"
  | "frequent_mental_distress"
  | "excessive_drinking";

// IDs for the sub-data types (if any) for theDropDownId
export type VariableId =
  | "population"
  | "population_2010"
  | "cases"
  | "deaths"
  | "hospitalizations"
  | "cases"
  | "cases"
  | "health_coverage"
  | "poverty"
  | "vaccinations"
  | "non_medical_drug_use"
  | "non_medical_rx_opioid_use"
  | "illicit_opioid_use";

// consts for simpler code
export const VAXX: VariableId = "vaccinations";

export type MetricId =
  | "acs_vaccine_population_pct"
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
  | "frequent_mental_distress_pct"
  | "frequent_mental_distress_pct_share"
  | "frequent_mental_distress_per_100k"
  | "depression_pct"
  | "depression_pct_share"
  | "depression_per_100k"
  | "suicide_pct_share"
  | "suicide_per_100k"
  | "excessive_drinking_pct"
  | "excessive_drinking_pct_share"
  | "excessive_drinking_per_100k"
  | "illicit_opioid_use_pct"
  | "illicit_opioid_use_pct_share"
  | "illicit_opioid_use_per_100k"
  | "non_medical_drug_use_pct"
  | "non_medical_drug_use_pct_share"
  | "non_medical_drug_use_per_100k"
  | "non_medical_rx_opioid_use_pct"
  | "non_medical_rx_opioid_use_pct_share"
  | "non_medical_rx_opioid_use_per_100k";

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

  secondaryPopulationComparisonMetric?: MetricConfig;
};

export type VariableConfig = {
  variableId: VariableId;
  variableDisplayName: string;
  variableFullDisplayName: string;
  variableDefinition?: string;
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
      variableDefinition: `A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a case definition. Cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.`,
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
          fullCardTitleName: "COVID-19 Cases Per 100k People",
          shortVegaLabel: "cases per 100k",
          type: "per100k",
        },
      },
    },
    {
      variableId: "deaths",
      variableDisplayName: "Deaths",
      variableFullDisplayName: "COVID-19 Deaths",
      variableDefinition: `The number of people who died due to COVID-19.`,
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
          fullCardTitleName: "COVID-19 Deaths Per 100k People",
          shortVegaLabel: "deaths per 100k",
          type: "per100k",
        },
      },
    },
    {
      variableId: "hospitalizations",
      variableDisplayName: "Hospitalizations",
      variableFullDisplayName: "COVID-19 Hospitalizations",
      variableDefinition: `People who were hospitalized with/due to confirmed cases of COVID-19.`,
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
          fullCardTitleName: "COVID-19 Hospitalizations Per 100k People",
          shortVegaLabel: "hospitalizations per 100k",
          type: "per100k",
        },
      },
    },
  ],

  vaccinations: [
    {
      variableId: "vaccinations",
      variableDisplayName: "Vaccinations",
      variableFullDisplayName: "COVID-19 Vaccinations",
      variableDefinition: `For the national level and most states this indicates people who have received at least one dose of a COVID-19 vaccine.`,
      metrics: {
        per100k: {
          metricId: "vaccinated_per_100k",
          fullCardTitleName: "COVID-19 Vaccinations Per 100k People",
          shortVegaLabel: "COVID-19 vaccinations per 100k",
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
          secondaryPopulationComparisonMetric: {
            metricId: "acs_vaccine_population_pct",
            fullCardTitleName: "Population Percentage According to ACS",
            shortVegaLabel: "pop percentage according to acs",
            type: "pct_share",
          },
        },
      },
    },
  ],

  suicide: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Suicides",
      variableDefinition: `Deaths due to intentional self-harm.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "suicide_pct_share",
          fullCardTitleName: "Share Of Total Suicides",
          shortVegaLabel: "% of suicides",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "suicide_per_100k",
          fullCardTitleName: "Suicides Per 100k People",
          shortVegaLabel: "suicides per 100k",
          type: "per100k",
        },
      },
    },
  ],
  depression: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Depression Cases",
      variableDefinition: `Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "depression_pct_share",
          fullCardTitleName: "Share Of Total Depression Cases",
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
          metricId: "depression_per_100k",
          fullCardTitleName: "Cases of Depression Per 100k People",
          shortVegaLabel: "cases of depression per 100k",
          type: "per100k",
        },
      },
    },
  ],
  excessive_drinking: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Excessive Drinking Cases",
      variableDefinition: `Adults who reported binge drinking (four or more [females] or five or more [males] drinks on one occasion in the past 30 days) or heavy drinking (eight or more [females] or 15 or more [males] drinks per week).`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "excessive_drinking_pct_share",
          fullCardTitleName: "Share Of All Excessive Drinking Cases",
          shortVegaLabel: "% of all cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortVegaLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "excessive_drinking_per_100k",
          fullCardTitleName: "Cases of Excessive Drinking Per 100k People",
          shortVegaLabel: "cases of excessive drinking per 100k",
          type: "per100k",
        },
      },
    },
  ],
  drug_misuse: [
    {
      variableId: "non_medical_drug_use",
      variableDisplayName: "Non-medical Drugs",
      variableFullDisplayName: "Non-medical Drug Use",
      variableDefinition: `Adults who reported using prescription drugs non-medically (including pain relievers, stimulants, sedatives) or illicit drugs (excluding cannabis) in the last 12 months. Note: This data type includes both of the other opioid-related data types: “Non-medical Use of Prescription Opioids” and “Use of Illicit Opioids”.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "non_medical_drug_use_pct_share",
          fullCardTitleName: "Share Of Total Non-medical Drug Use",
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
          metricId: "non_medical_drug_use_per_100k",
          fullCardTitleName: "Non-medical Drug Use Per 100k People",
          shortVegaLabel: "cases of non-medical drug use per 100k",
          type: "per100k",
        },
      },
    },
    {
      variableId: "non_medical_rx_opioid_use",
      variableDisplayName: "Non-medical Prescription Opioids",
      variableFullDisplayName: "Non-medical Prescription Opioid Use",
      variableDefinition: `Adults who reported using illicit opioids. Note: This is a subset of the “Non-medical Drug Use” data type.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "non_medical_rx_opioid_use_pct_share",
          fullCardTitleName:
            "Share Of Total Non-medical Prescription Opioid Use",
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
          metricId: "non_medical_rx_opioid_use_per_100k",
          fullCardTitleName:
            "Non-medical Prescription Opioid Use Per 100k People",
          shortVegaLabel: "cases of non-medical rx opioid use per 100k",
          type: "per100k",
        },
      },
    },
    {
      variableId: "illicit_opioid_use",
      variableDisplayName: "Illicit Opioids",
      variableFullDisplayName: "Illicit Opioid Use",
      variableDefinition: `Adults who reported using prescription opioids non-medically. Note: This is a subset of the “Non-medical Drug Use” data type.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "illicit_opioid_use_pct_share",
          fullCardTitleName: "Share Of Total Illicit Opioid Use",
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
          metricId: "illicit_opioid_use_per_100k",
          fullCardTitleName: "Cases of Illicit Opioid Use Per 100k People",
          shortVegaLabel: "cases of illicit opioid use per 100k",
          type: "per100k",
        },
      },
    },
  ],

  frequent_mental_distress: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Frequent Mental Distress Cases",
      variableDefinition: `Adults who reported their mental health was not good 14 or more days in the past 30 days.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "frequent_mental_distress_pct_share",
          fullCardTitleName: "Share Of All Frequent Mental Distress Cases",
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
          metricId: "frequent_mental_distress_per_100k",
          fullCardTitleName: "Frequent Mental Distress Cases Per 100k People",
          shortVegaLabel: "frequent mental distress cases per 100k",
          type: "per100k",
        },
      },
    },
  ],
  diabetes: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Diabetes",
      variableDefinition: `Adults who reported being told by a health professional that they have diabetes (excluding prediabetes and gestational diabetes).`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "diabetes_pct_share",
          fullCardTitleName: "Share Of All Diabetes Cases",
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
          fullCardTitleName: "Diabetes Cases Per 100k People",
          shortVegaLabel: "diabetes per 100k",
          type: "per100k",
        },
      },
    },
  ],
  copd: [
    {
      variableId: "cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "COPD",
      variableDefinition: `Adults who reported being told by a health professional that they have chronic obstructive pulmonary disease, emphysema or chronic bronchitis.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "copd_pct_share",
          fullCardTitleName: "Share Of All COPD Cases",
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
          fullCardTitleName: "Cases of COPD Per 100k People",
          shortVegaLabel: "COPD per 100k",
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
      variableDefinition: `Health insurance coverage in the ACS and other Census Bureau surveys define coverage to
        include plans and programs that provide comprehensive health coverage. Plans that provide
        insurance only for specific conditions or situations such as cancer and long-term care policies
        are not considered comprehensive health coverage. Likewise, other types of insurance like
        dental, vision, life, and disability insurance are not considered comprehensive health
        insurance coverage.`,
      metrics: {
        per100k: {
          metricId: "health_insurance_per_100k",
          fullCardTitleName: "Uninsured Per 100k People",
          shortVegaLabel: "uninsured individuals per 100k",
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
      variableDefinition: `Following the Office of Management and Budget's (OMB) Statistical Policy Directive 14, the Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using the Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps).`,
      metrics: {
        per100k: {
          metricId: "poverty_per_100k",
          fullCardTitleName: "Cases of Poverty Per 100k People",
          shortVegaLabel: "cases of poverty per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "poverty_pct_share",
          fullCardTitleName: "Share Of Poverty",
          shortVegaLabel: "% of all impoverished",
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
};
