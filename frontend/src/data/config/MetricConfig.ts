//  IDs for the selectable conditions in the madlib

export type DropdownVarId =
  | "covid"
  | "diabetes"
  | "copd"
  | "health_insurance"
  | "poverty"
  | "covid_vaccinations"
  | "depression"
  | "suicide"
  | "substance"
  | "frequent_mental_distress"
  | "excessive_drinking"
  | "preventable_hospitalizations"
  | "avoided_care"
  | "chronic_kidney_disease"
  | "cardiovascular_diseases"
  | "asthma"
  | "voter_participation";

export type AgeAdjustedVariableId = "covid_deaths" | "covid_hospitalizations";

// IDs for the sub-data types (if any) for theDropDownId
export type VariableId =
  | DropdownVarId
  | AgeAdjustedVariableId
  | "population"
  | "population_2010"
  | "covid_cases"
  | "non_medical_drug_use"
  | "non_medical_rx_opioid_use"
  | "illicit_opioid_use";

export type MetricId =
  | "acs_vaccine_population_pct"
  | "brfss_population_pct"
  | "copd_pct_share"
  | "copd_per_100k"
  | "copd_ratio_age_adjusted"
  | "covid_cases"
  | "covid_cases_per_100k"
  | "covid_cases_reporting_population"
  | "covid_cases_reporting_population_pct"
  | "covid_cases_share"
  | "covid_cases_share_of_known"
  | "cases_ratio_age_adjusted"
  | "covid_deaths"
  | "covid_deaths_per_100k"
  | "covid_deaths_reporting_population"
  | "covid_deaths_reporting_population_pct"
  | "covid_deaths_share"
  | "covid_deaths_share_of_known"
  | "death_ratio_age_adjusted"
  | "covid_hosp"
  | "covid_hosp_per_100k"
  | "covid_hosp_reporting_population"
  | "covid_hosp_reporting_population_pct"
  | "covid_hosp_share"
  | "covid_hosp_share_of_known"
  | "hosp_ratio_age_adjusted"
  | "diabetes_pct_share"
  | "diabetes_per_100k"
  | "diabetes_ratio_age_adjusted"
  | "health_insurance_count"
  | "health_insurance_pct_share"
  | "health_insurance_per_100k"
  | "health_insurance_population_pct"
  | "health_insurance_ratio_age_adjusted"
  | "population"
  | "population_pct"
  | "population_2010"
  | "population_pct_2010"
  | "poverty_count"
  | "poverty_pct_share"
  | "poverty_per_100k"
  | "poverty_population_pct"
  | "poverty_ratio_age_adjusted"
  | "vaccinated_pct_share"
  | "vaccinated_share_of_known"
  | "vaccinated_per_100k"
  | "vaccine_population_pct"
  | "vaccinated_ratio_age_adjusted"
  | "frequent_mental_distress_pct_share"
  | "frequent_mental_distress_per_100k"
  | "frequent_mental_distress_ratio_age_adjusted"
  | "depression_pct_share"
  | "depression_per_100k"
  | "depression_ratio_age_adjusted"
  | "suicide_pct_share"
  | "suicide_per_100k"
  | "suicide_ratio_age_adjusted"
  | "excessive_drinking_pct_share"
  | "excessive_drinking_per_100k"
  | "excessive_drinking_ratio_age_adjusted"
  | "illicit_opioid_use_pct_share"
  | "illicit_opioid_use_per_100k"
  | "illicit_opioid_use_ratio_age_adjusted"
  | "non_medical_drug_use_pct_share"
  | "non_medical_drug_use_per_100k"
  | "non_medical_drug_use_ratio_age_adjusted"
  | "non_medical_rx_opioid_use_pct_share"
  | "non_medical_rx_opioid_use_per_100k"
  | "non_medical_rx_opioid_use_ratio_age_adjusted"
  | "preventable_hospitalizations_pct_share"
  | "preventable_hospitalizations_per_100k"
  | "preventable_hospitalizations_ratio_age_adjusted"
  | "avoided_care_pct_share"
  | "avoided_care_per_100k"
  | "avoided_care_ratio_age_adjusted"
  | "chronic_kidney_disease_pct_share"
  | "chronic_kidney_disease_per_100k"
  | "chronic_kidney_disease_ratio_age_adjusted"
  | "cardiovascular_diseases_pct_share"
  | "cardiovascular_diseases_per_100k"
  | "cardiovascular_diseases_ratio_age_adjusted"
  | "asthma_pct_share"
  | "asthma_per_100k"
  | "asthma_ratio_age_adjusted"
  | "voter_participation_pct_share"
  | "voter_participation_per_100k"
  | "voter_participation_ratio_age_adjusted";

// The type of metric indicates where and how this a MetricConfig is represented in the frontend:
// What chart types are applicable, what metrics are shown together, display names, etc.
export type MetricType =
  | "count"
  | "pct_share"
  | "pct_share_to_pop_ratio"
  | "per100k"
  | "percentile"
  | "index"
  | "ratio";

export type MetricConfig = {
  metricId: MetricId;
  fullCardTitleName: string;
  shortLabel: string;
  unknownsVegaLabel?: string;
  type: MetricType;
  populationComparisonMetric?: MetricConfig;
  ageAdjusted?: boolean;

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
      shortLabel: "people",
      type: "count",
    },
    pct_share: {
      metricId: "population_pct",
      fullCardTitleName: populationPctTitle,
      shortLabel: populationPctShortLabel,
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
      shortLabel: "people",
      type: "count",
    },
    pct_share: {
      metricId: "population_pct_2010",
      fullCardTitleName: populationPctTitle,
      shortLabel: populationPctShortLabel,
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
  const isRatio = metricType.includes("ratio");
  let formatOptions = isPctShare ? { minimumFractionDigits: 1 } : {};
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en", formatOptions)
      : value;
  const percentSuffix = isPctShare && !omitPctSymbol ? "%" : "";
  const ratioSuffix = isRatio ? "×" : "";
  return `${formattedValue}${percentSuffix}${ratioSuffix}`;
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

export function getAgeAdjustedRatioMetric(
  variableConfig: VariableConfig
): MetricConfig[] {
  let tableFields: MetricConfig[] = [];
  if (variableConfig) {
    if (variableConfig.metrics["age_adjusted_ratio"]) {
      // Ratios for Table
      tableFields.push(variableConfig.metrics["age_adjusted_ratio"]);
      // pct_share for Unknowns Alert
      tableFields.push(variableConfig.metrics["pct_share"]);
    }
  }
  return tableFields;
}

// TODO - strongly type key
// TODO - count and pct_share metric types should require populationComparisonMetric

// Note: metrics must be declared in a consistent order because the UI relies
// on this to build toggles.
// TODO: make the UI consistent regardless of metric config order.
export const METRIC_CONFIG: Record<DropdownVarId, VariableConfig[]> = {
  covid: [
    {
      variableId: "covid_cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "COVID-19 Cases",
      variableDefinition: `A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a case definition. Cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.`,
      metrics: {
        count: {
          metricId: "covid_cases",
          fullCardTitleName: "COVID-19 Cases",
          shortLabel: "COVID-19 cases",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_cases_reporting_population",
            fullCardTitleName: "Population",
            shortLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_cases_share",
          fullCardTitleName: "Share Of Total COVID-19 Cases",
          unknownsVegaLabel: "% unknown",
          shortLabel: "% of COVID-19 cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_cases_reporting_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_cases_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Cases",
            shortLabel: "% of COVID-19 cases",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_cases_per_100k",
          fullCardTitleName: "COVID-19 Cases Per 100k People",
          shortLabel: "cases per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "cases_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of COVID-19 Compared to White (Non-Hispanic)",
          shortLabel: "Risk of COVID-19",
          type: "ratio",
        },
      },
    },
    {
      variableId: "covid_deaths",
      variableDisplayName: "Deaths",
      variableFullDisplayName: "COVID-19 Deaths",
      variableDefinition: `The number of people who died due to COVID-19.`,
      metrics: {
        count: {
          metricId: "covid_deaths",
          fullCardTitleName: "COVID-19 Deaths",
          shortLabel: "COVID-19 Deaths",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_deaths_reporting_population",
            fullCardTitleName: "Population",
            shortLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_deaths_share",
          fullCardTitleName: "Share Of Total COVID-19 Deaths",
          shortLabel: "% of COVID-19 deaths",
          unknownsVegaLabel: "% unknown",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_deaths_reporting_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_deaths_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Deaths",
            shortLabel: "% of COVID-19 deaths",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_deaths_per_100k",
          fullCardTitleName: "COVID-19 Deaths Per 100k People",
          shortLabel: "deaths per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "death_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of COVID-19 Death Compared to White (Non-Hispanic)",
          shortLabel: "Risk of COVID-19 Death", // table header-row label
          type: "ratio",
          ageAdjusted: true,
        },
      },
    },
    {
      variableId: "covid_hospitalizations",
      variableDisplayName: "Hospitalizations",
      variableFullDisplayName: "COVID-19 Hospitalizations",
      variableDefinition: `The number of people hospitalized at any point while ill with COVID-19.`,
      metrics: {
        count: {
          metricId: "covid_hosp",
          fullCardTitleName: "COVID-19 Hospitalizations",
          shortLabel: "COVID-19 hospitalizations",
          type: "count",
          populationComparisonMetric: {
            metricId: "covid_hosp_reporting_population",
            fullCardTitleName: "Population",
            shortLabel: "people",
            type: "count",
          },
        },
        pct_share: {
          metricId: "covid_hosp_share",
          fullCardTitleName: "Share Of Total COVID-19 Hospitalizations",
          shortLabel: "% of COVID-19 hospitalizations",
          unknownsVegaLabel: "% unknown",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "covid_hosp_reporting_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "covid_hosp_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Hospitalizations",
            shortLabel: "% of COVID-19 hospitalizations",
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "covid_hosp_per_100k",
          fullCardTitleName: "COVID-19 Hospitalizations Per 100k People",
          shortLabel: "hospitalizations per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "hosp_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of COVID-19 Hospitalization Compared to White (Non-Hispanic)",
          shortLabel: "Risk of COVID-19 Hospitalization", // Table header-row label
          type: "ratio",
          ageAdjusted: true,
        },
      },
    },
  ],

  covid_vaccinations: [
    {
      variableId: "covid_vaccinations",
      variableDisplayName: "Vaccinations",
      variableFullDisplayName: "COVID-19 Vaccinations",
      variableDefinition: `For the national level and most states this indicates people who have received at least one dose of a COVID-19 vaccine.`,
      metrics: {
        per100k: {
          metricId: "vaccinated_per_100k",
          fullCardTitleName: "COVID-19 Vaccinations Per 100k People",
          shortLabel: "COVID-19 vaccinations per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "vaccinated_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Ratio of COVID-19 Vaccination Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
        pct_share: {
          metricId: "vaccinated_pct_share",
          fullCardTitleName: "Share Of Total COVID-19 Vaccinations",
          unknownsVegaLabel: "% unknown",
          shortLabel: "% of vaccinations",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "vaccine_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "vaccinated_share_of_known",
            fullCardTitleName: "Share Of Total COVID-19 Vaccinations",
            shortLabel: "% of vaccinations",
            type: "pct_share",
          },
          secondaryPopulationComparisonMetric: {
            metricId: "acs_vaccine_population_pct",
            fullCardTitleName: "Population Percentage According to ACS",
            shortLabel: "pop percentage according to acs",
            type: "pct_share",
          },
        },
      },
    },
  ],

  suicide: [
    {
      variableId: "suicide",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Suicides",
      variableDefinition: `Deaths due to intentional self-harm.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "suicide_pct_share",
          fullCardTitleName: "Share Of Total Suicides",
          shortLabel: "% of suicides",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "suicide_per_100k",
          fullCardTitleName: "Suicides Per 100k People",
          shortLabel: "suicides per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "suicide_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Suicide Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  depression: [
    {
      variableId: "depression",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Depression Cases",
      variableDefinition: `Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "depression_pct_share",
          fullCardTitleName: "Share Of Total Depression Cases",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "depression_per_100k",
          fullCardTitleName: "Cases of Depression Per 100k People",
          shortLabel: "cases of depression per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "depression_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Depression Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  excessive_drinking: [
    {
      variableId: "excessive_drinking",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Excessive Drinking Cases",
      variableDefinition: `Adults who reported binge drinking (four or more [females] or five or more [males] drinks on one occasion in the past 30 days) or heavy drinking (eight or more [females] or 15 or more [males] drinks per week).`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "excessive_drinking_pct_share",
          fullCardTitleName: "Share Of All Excessive Drinking Cases",
          shortLabel: "% of all cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "excessive_drinking_per_100k",
          fullCardTitleName: "Cases of Excessive Drinking Per 100k People",
          shortLabel: "cases of excessive drinking per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "excessive_drinking_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Excessive Drinking Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  substance: [
    {
      // parent data type
      variableId: "non_medical_drug_use",
      variableDisplayName: "Non-medical Drugs",
      variableFullDisplayName: "Non-medical Drug Use",
      variableDefinition: `Adults who reported using prescription drugs non-medically (including pain relievers, stimulants, sedatives) or illicit drugs (excluding cannabis) in the last 12 months. Note: This data type includes both of the other opioid-related data types: “Non-medical Use of Prescription Opioids” and “Use of Illicit Opioids”.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "non_medical_drug_use_pct_share",
          fullCardTitleName: "Share Of Total Non-medical Drug Use",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "non_medical_drug_use_per_100k",
          fullCardTitleName: "Cases of Non-medical Drug Use Per 100k People",
          shortLabel: "cases of non-medical drug use per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "non_medical_drug_use_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Non-medical Drug Use Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
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
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "non_medical_rx_opioid_use_per_100k",
          fullCardTitleName:
            "Cases of Non-medical Prescription Opioid Use Per 100k People",
          shortLabel: "cases of non-medical rx opioid use per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "non_medical_rx_opioid_use_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Non-medical Prescription Opioid Use Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
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
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "illicit_opioid_use_per_100k",
          fullCardTitleName: "Cases of Illicit Opioid Use Per 100k People",
          shortLabel: "cases of illicit opioid use per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "illicit_opioid_use_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Illicit Opioid Use Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],

  frequent_mental_distress: [
    {
      variableId: "frequent_mental_distress",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Frequent Mental Distress Cases",
      variableDefinition: `Adults who reported their mental health was not good 14 or more days in the past 30 days.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "frequent_mental_distress_pct_share",
          fullCardTitleName: "Share Of All Frequent Mental Distress Cases",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "frequent_mental_distress_per_100k",
          fullCardTitleName: "Frequent Mental Distress Cases Per 100k People",
          shortLabel: "frequent mental distress cases per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "frequent_mental_distress_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Frequent Mental Distress Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  diabetes: [
    {
      variableId: "diabetes",
      variableDisplayName: "Cases",
      variableFullDisplayName: "Diabetes",
      variableDefinition: `Adults who reported being told by a health professional that they have diabetes (excluding prediabetes and gestational diabetes).`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "diabetes_pct_share",
          fullCardTitleName: "Share Of Total Diabetes Cases",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "diabetes_per_100k",
          fullCardTitleName: "Diabetes Cases Per 100k People",
          shortLabel: "diabetes cases per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "diabetes_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Diabetes Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  copd: [
    {
      variableId: "copd",
      variableDisplayName: "Cases",
      variableFullDisplayName: "COPD",
      variableDefinition: `Adults who reported being told by a health professional that they have chronic obstructive pulmonary disease, emphysema or chronic bronchitis.`,
      surveyCollectedData: true,
      metrics: {
        pct_share: {
          metricId: "copd_pct_share",
          fullCardTitleName: "Share Of Total COPD Cases",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "copd_per_100k",
          fullCardTitleName: "COPD Cases Per 100k People",
          shortLabel: "COPD cases per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "copd_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of COPD Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],

  health_insurance: [
    {
      variableId: "health_insurance",
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
          fullCardTitleName: "Uninsured Individuals Per 100k People",
          shortLabel: "uninsured individuals per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "health_insurance_pct_share",
          fullCardTitleName: "Share Of Uninsured Individuals",
          shortLabel: "% of uninsured",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "health_insurance_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "health_insurance_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Being Uninsured Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
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
          fullCardTitleName:
            "Individuals Below The Poverty Line Per 100k People",
          shortLabel: "individuals below the poverty line per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "poverty_pct_share",
          fullCardTitleName: "Share Of Poverty",
          shortLabel: "% of impoverished",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "poverty_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "poverty_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Poverty Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  preventable_hospitalizations: [
    {
      variableId: "preventable_hospitalizations",
      variableDisplayName: "Preventable Hospitalizations",
      variableFullDisplayName: "Preventable Hospitalizations",
      variableDefinition: `Discharges following hospitalization for diabetes with short- or long-term complications, uncontrolled diabetes without complications, diabetes with lower-extremity amputation, chronic obstructive pulmonary disease, angina without a procedure, asthma, hypertension, heart failure, dehydration, bacterial pneumonia or urinary tract infection per 100,000 Medicare beneficiaries ages 18 and older continuously enrolled in Medicare fee-for-service Part A.`,
      metrics: {
        per100k: {
          metricId: "preventable_hospitalizations_per_100k",
          fullCardTitleName: "Preventable Hospitalizations Per 100k People",
          shortLabel: "preventable hospitalizations per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "preventable_hospitalizations_pct_share",
          fullCardTitleName: "Share Of All Preventable Hospitalizations",
          shortLabel: "% of hospitalizations",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "preventable_hospitalizations_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Preventable Hospitalization Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  avoided_care: [
    {
      variableId: "avoided_care",
      variableDisplayName: "Avoided Care",
      variableFullDisplayName: "Care Avoidance Due to Cost",
      variableDefinition: `Adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost.`,
      surveyCollectedData: true,
      metrics: {
        per100k: {
          metricId: "avoided_care_per_100k",
          fullCardTitleName:
            "Individuals Who Avoided Care Due to Cost Per 100k People",
          shortLabel: "individuals who avoided care per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "avoided_care_pct_share",
          fullCardTitleName: "Share Of All Care Avoidance Due to Cost",
          shortLabel: "% of avoidance",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "avoided_care_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Care Avoidance Due to Cost Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  asthma: [
    {
      variableId: "asthma",
      variableDisplayName: "Asthma",
      variableFullDisplayName: "Asthma Cases",
      surveyCollectedData: true,
      variableDefinition: `Adults who reported being told by a health professional that they currently have asthma.`,
      metrics: {
        per100k: {
          metricId: "asthma_per_100k",
          fullCardTitleName: "Individuals with Asthma Per 100k People",
          shortLabel: "asthma per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "asthma_pct_share",
          fullCardTitleName: "Share Of All Asthma Cases",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "asthma_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Asthma Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  cardiovascular_diseases: [
    {
      variableId: "cardiovascular_diseases",
      variableDisplayName: "Cardiovascular Diseases",
      variableFullDisplayName: "Cases of Cardiovascular Diseases",
      surveyCollectedData: true,
      variableDefinition: `Adults who reported being told by a health professional that they had angina or coronary heart disease; a heart attack or myocardial infarction; or a stroke.`,
      metrics: {
        per100k: {
          metricId: "cardiovascular_diseases_per_100k",
          fullCardTitleName: "Cases of Cardiovascular Diseases Per 100k People",
          shortLabel: "cases of cardiovascular diseases",
          type: "per100k",
        },
        pct_share: {
          metricId: "cardiovascular_diseases_pct_share",
          fullCardTitleName: "Share Of All Cases of Cardiovascular Diseases",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "cardiovascular_diseases_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Cardiovascular Diseases Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  chronic_kidney_disease: [
    {
      variableId: "chronic_kidney_disease",
      variableDisplayName: "Chronic Kidney Disease",
      surveyCollectedData: true,
      variableFullDisplayName: "Cases of Chronic Kidney Disease",
      variableDefinition: `Adults who reported being told by a health professional that they have kidney disease not including kidney stones, bladder infection or incontinence.`,
      metrics: {
        per100k: {
          metricId: "chronic_kidney_disease_per_100k",
          fullCardTitleName: "Cases of Chronic Kidney Disease Per 100k People",
          shortLabel: "cases of chronic kidney disease per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "chronic_kidney_disease_pct_share",
          fullCardTitleName: "Share Of Chronic All Kidney Disease Cases",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "chronic_kidney_disease_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Risk of Chronic Kidney Disease Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  voter_participation: [
    {
      variableId: "voter_participation",
      variableDisplayName: "Voter Participation",
      variableFullDisplayName: "Voter Participation",
      surveyCollectedData: true,
      variableDefinition: `U.S. citizens ages 18 and older who voted in either the last presidential election, the last midterm national election, or the average of both where that data is available.`,
      metrics: {
        per100k: {
          metricId: "voter_participation_per_100k",
          fullCardTitleName: "Participating Voters Per 100k People",
          shortLabel: "voters per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "voter_participation_pct_share",
          fullCardTitleName: "Share Of All Voter Participation",
          shortLabel: "% of voters",
          type: "pct_share",
          populationComparisonMetric: {
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        age_adjusted_ratio: {
          metricId: "voter_participation_ratio_age_adjusted",
          fullCardTitleName:
            "Age-Adjusted Voter Participation Ratio Compared to White (Non-Hispanic)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
};
