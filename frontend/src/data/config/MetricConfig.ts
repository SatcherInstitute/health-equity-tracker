//  IDs for the selectable conditions in the madlib
// NOTE: these strings are displayed to the user if the data type toggle is enabled.
// Underscores become spaces, and all letters are capitalized
// TODO: integrate strings from Category / Madlib into the Metric Config
// so ALL related topic data is contained in a single object

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
  | "voter_participation"
  | "women_in_legislative_office"
  | "incarceration";

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
  | "illicit_opioid_use"
  | "health_coverage"
  | "poverty"
  | "suicides"
  | "women_us_congress"
  | "women_state_legislatures"
  | "prison"
  | "jail"
  | "covid_vaccinations";

export type MetricId =
  | "acs_vaccine_population_pct"
  | "brfss_population_pct"
  | "cawp_population_pct"
  | "bjs_population_pct"
  | "vera_population_pct"
  | "incarceration_population_pct"
  | "copd_pct_share"
  | "copd_per_100k"
  | "copd_ratio_age_adjusted"
  | "copd_pct_relative_inequity"
  | "covid_cases"
  | "covid_cases_per_100k"
  | "covid_cases_reporting_population"
  | "covid_cases_reporting_population_pct"
  | "covid_cases_share"
  | "covid_cases_share_of_known"
  | "cases_ratio_age_adjusted"
  | "covid_cases_pct_relative_inequity"
  | "covid_deaths"
  | "covid_deaths_per_100k"
  | "covid_deaths_reporting_population"
  | "covid_deaths_reporting_population_pct"
  | "covid_deaths_share"
  | "covid_deaths_share_of_known"
  | "covid_deaths_pct_relative_inequity"
  | "death_ratio_age_adjusted"
  | "covid_hosp"
  | "covid_hosp_per_100k"
  | "covid_hosp_reporting_population"
  | "covid_hosp_reporting_population_pct"
  | "covid_hosp_share"
  | "covid_hosp_share_of_known"
  | "covid_population_pct"
  | "hosp_ratio_age_adjusted"
  | "covid_hosp_pct_relative_inequity"
  | "diabetes_pct_share"
  | "diabetes_per_100k"
  | "diabetes_ratio_age_adjusted"
  | "diabetes_pct_relative_inequity"
  | "health_insurance_count"
  | "health_insurance_pct_share"
  | "health_insurance_per_100k"
  | "health_insurance_population_pct"
  | "health_insurance_ratio_age_adjusted"
  | "health_insurance_pct_relative_inequity"
  | "population"
  | "population_pct"
  | "population_2010"
  | "population_pct_2010"
  | "poverty_count"
  | "poverty_pct_share"
  | "poverty_per_100k"
  | "poverty_population_pct"
  | "poverty_ratio_age_adjusted"
  | "poverty_pct_relative_inequity"
  | "vaccinated_pct_share"
  | "vaccinated_share_of_known"
  | "vaccinated_per_100k"
  | "vaccine_population_pct"
  | "vaccinated_ratio_age_adjusted"
  | "vaccinated_pct_relative_inequity"
  | "frequent_mental_distress_pct_share"
  | "frequent_mental_distress_per_100k"
  | "frequent_mental_distress_ratio_age_adjusted"
  | "frequent_mental_distress_pct_relative_inequity"
  | "depression_pct_share"
  | "depression_per_100k"
  | "depression_ratio_age_adjusted"
  | "depression_pct_relative_inequity"
  | "suicide_pct_share"
  | "suicide_per_100k"
  | "suicide_ratio_age_adjusted"
  | "suicide_pct_relative_inequity"
  | "excessive_drinking_pct_share"
  | "excessive_drinking_per_100k"
  | "excessive_drinking_ratio_age_adjusted"
  | "excessive_drinking_pct_relative_inequity"
  | "illicit_opioid_use_pct_share"
  | "illicit_opioid_use_per_100k"
  | "illicit_opioid_use_ratio_age_adjusted"
  | "illicit_opioid_use_pct_relative_inequity"
  | "non_medical_drug_use_pct_share"
  | "non_medical_drug_use_per_100k"
  | "non_medical_drug_use_ratio_age_adjusted"
  | "non_medical_drug_use_pct_relative_inequity"
  | "non_medical_rx_opioid_use_pct_share"
  | "non_medical_rx_opioid_use_per_100k"
  | "non_medical_rx_opioid_use_ratio_age_adjusted"
  | "non_medical_rx_opioid_use_pct_relative_inequity"
  | "preventable_hospitalizations_pct_share"
  | "preventable_hospitalizations_per_100k"
  | "preventable_hospitalizations_ratio_age_adjusted"
  | "preventable_hospitalizations_pct_relative_inequity"
  | "avoided_care_pct_share"
  | "avoided_care_per_100k"
  | "avoided_care_ratio_age_adjusted"
  | "avoided_care_pct_relative_inequity"
  | "chronic_kidney_disease_pct_share"
  | "chronic_kidney_disease_per_100k"
  | "chronic_kidney_disease_ratio_age_adjusted"
  | "chronic_kidney_disease_pct_relative_inequity"
  | "cardiovascular_diseases_pct_share"
  | "cardiovascular_diseases_per_100k"
  | "cardiovascular_diseases_ratio_age_adjusted"
  | "cardiovascular_diseases_pct_relative_inequity"
  | "asthma_pct_share"
  | "asthma_per_100k"
  | "asthma_ratio_age_adjusted"
  | "asthma_pct_relative_inequity"
  | "voter_participation_pct_share"
  | "voter_participation_per_100k"
  | "voter_participation_ratio_age_adjusted"
  | "voter_participation_pct_relative_inequity"
  | "women_state_leg_pct"
  | "women_state_leg_pct_share"
  | "women_state_leg_ratio_age_adjusted"
  | "women_state_leg_pct_relative_inequity"
  // | "pct_share_of_us_congress"
  // | "pct_share_of_women_us_congress"
  | "pct_share_of_us_congress"
  | "pct_share_of_women_us_congress"
  | "women_us_congress_ratio_age_adjusted"
  | "pct_share_of_us_congress_relative_inequity"
  | "prison_pct_share"
  | "prison_per_100k"
  | "prison_ratio_age_adjusted"
  | "prison_pct_relative_inequity"
  | "jail_pct_share"
  | "jail_per_100k"
  | "jail_ratio_age_adjusted"
  | "jail_pct_relative_inequity"
  | "total_confined_children"
  | "svi";

// The type of metric indicates where and how this a MetricConfig is represented in the frontend:
// What chart types are applicable, what metrics are shown together, display names, etc.
export type MetricType =
  | "count"
  | "pct_share"
  | "per100k"
  | "pct_relative_inequity"
  | "pct_incidence"
  | "index"
  | "ratio";

export type MetricConfig = {
  metricId: MetricId;
  fullCardTitleName: string;
  trendsCardTitleName?: string;
  chartTitle?: string;
  mobileChartTitle?: string[];
  shortLabel: string;
  unknownsVegaLabel?: string;
  type: MetricType;
  populationComparisonMetric?: MetricConfig;
  ageAdjusted?: boolean;
  isMonthly?: boolean;

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
  timeSeriesData?: boolean;
};

const populationPctTitle = "Population share";
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

export const SYMBOL_TYPE_LOOKUP: Record<MetricType, string> = {
  per100k: "per 100k",
  pct_share: "% share",
  count: "people",
  index: "",
  ratio: "×",
  pct_relative_inequity: "%",
  pct_incidence: "%",
};

export function isPctType(metricType: MetricType) {
  return ["pct_share", "pct_relative_inequity", "pct_incidence"].includes(
    metricType
  );
}

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

  // if values are numeric but rounded down to 0, instead replace with "less than 1"
  if (value === 0 && metricType === "per100k") return "<1";

  const isRatio = metricType.includes("ratio");
  let formatOptions = isPctType(metricType) ? { minimumFractionDigits: 1 } : {};
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en", formatOptions)
      : value;
  const percentSuffix = isPctType(metricType) && !omitPctSymbol ? "%" : "";
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

// TODO - count and pct_share metric types should require populationComparisonMetric

// Note: metrics must be declared in a consistent order because the UI relies
// on this to build toggles.
// TODO: make the UI consistent regardless of metric config order.
export const METRIC_CONFIG: Record<DropdownVarId, VariableConfig[]> = {
  covid: [
    {
      variableId: "covid_cases",
      variableDisplayName: "Cases",
      variableFullDisplayName: "COVID-19 cases",
      variableDefinition: `A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a case definition. cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.`,
      timeSeriesData: true,
      metrics: {
        pct_share: {
          metricId: "covid_cases_share",
          fullCardTitleName: "Share of total COVID-19 cases",
          chartTitle: "Share of total COVID-19 cases with unknown",
          unknownsVegaLabel: "% unknown",
          shortLabel: "% of COVID-19 cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total COVID-19 cases since Jan 2020",
            mobileChartTitle: [
              "Population vs distribution of",
              "total COVID-19 cases",
              "since Jan 2020",
            ],
            metricId: "covid_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "covid_cases_pct_relative_inequity",
          fullCardTitleName: "Inequitable distribution of COVID-19 cases",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
          isMonthly: true,
        },
        per100k: {
          metricId: "covid_cases_per_100k",
          fullCardTitleName: "Rates of COVID-19 cases",
          chartTitle: "COVID-19 cases since Jan 2020 per 100k people",
          mobileChartTitle: [
            "COVID-19 cases since Jan 2020",
            "per 100k people",
          ],
          trendsCardTitleName: "Monthly COVID-19 cases per 100k people",
          shortLabel: "cases per 100k",
          type: "per100k",
          isMonthly: true,
        },
        age_adjusted_ratio: {
          metricId: "cases_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of COVID-19 compared to White (NH)",
          shortLabel: "Risk of COVID-19",
          type: "ratio",
        },
      },
    },
    {
      variableId: "covid_deaths",
      variableDisplayName: "Deaths",
      variableFullDisplayName: "COVID-19 deaths",
      variableDefinition: `The number of people who died due to COVID-19.`,
      timeSeriesData: true,

      metrics: {
        pct_share: {
          metricId: "covid_deaths_share",
          fullCardTitleName: "Share of total COVID-19 deaths",
          chartTitle: "Share of total COVID-19 deaths with unknown",
          shortLabel: "% of COVID-19 deaths",
          unknownsVegaLabel: "% unknown",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total COVID-19 deaths since Jan 2020",
            mobileChartTitle: [
              "Population vs distribution of",
              "total COVID-19 deaths",
              "since Jan 2020",
            ],
            metricId: "covid_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "covid_deaths_pct_relative_inequity",
          fullCardTitleName: "Inequitable distribution of COVID-19 deaths",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
          isMonthly: true,
        },
        per100k: {
          metricId: "covid_deaths_per_100k",
          fullCardTitleName: "Rates of COVID-19 deaths",
          chartTitle: "COVID-19 deaths since Jan 2020 per 100k people",
          mobileChartTitle: [
            "COVID-19 deaths since Jan 2020",
            "per 100k people",
          ],
          trendsCardTitleName: "Monthly COVID-19 deaths per 100k people",
          shortLabel: "deaths per 100k",
          type: "per100k",
          isMonthly: true,
        },
        age_adjusted_ratio: {
          metricId: "death_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of COVID-19 death compared to White (NH)",
          chartTitle:
            "Age-adjusted risk of COVID-19 death compared to White (NH)",
          mobileChartTitle: [
            "Age-adjusted risk of COVID-19 death",
            "compared to White (NH)",
          ],
          shortLabel: "Risk of COVID-19 Death", // table header-row label
          type: "ratio",
          ageAdjusted: true,
        },
      },
    },
    {
      variableId: "covid_hospitalizations",
      variableDisplayName: "Hospitalizations",
      variableFullDisplayName: "COVID-19 hospitalizations",
      variableDefinition: `The number of people hospitalized at any point while ill with COVID-19.`,
      timeSeriesData: true,

      metrics: {
        pct_share: {
          metricId: "covid_hosp_share",
          fullCardTitleName: "Share of total COVID-19 hospitalizations",
          chartTitle: "Share of total COVID-19 hospitalizations with unknown",
          shortLabel: "% of COVID-19 hospitalizations",
          unknownsVegaLabel: "% unknown",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total COVID-19 hospitalizations since Jan 2020",
            mobileChartTitle: [
              "Population vs distribution of",
              "total COVID-19 hospitalizations",
              "since Jan 2020",
            ],
            metricId: "covid_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "covid_hosp_pct_relative_inequity",
          fullCardTitleName:
            "Inequitable distribution of COVID-19 hospitalizations",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
          isMonthly: true,
        },
        per100k: {
          metricId: "covid_hosp_per_100k",
          fullCardTitleName: "Rates of COVID-19 hospitalizations",
          chartTitle:
            "COVID-19 hospitalizations since Jan 2020 per 100k people",
          mobileChartTitle: [
            "COVID-19 hospitalizations since Jan 2020",
            "per 100k people",
          ],
          trendsCardTitleName:
            "Monthly COVID-19 hospitalizations per 100k people",
          shortLabel: "hospitalizations per 100k",
          type: "per100k",
          isMonthly: true,
        },
        age_adjusted_ratio: {
          metricId: "hosp_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of COVID-19 hospitalization compared to White (NH)",
          shortLabel: "Risk of COVID-19 hospitalization", // Table header-row label
          mobileChartTitle: [
            "Age-adjusted risk of COVID-19 hospitalization",
            "compared to White (NH)",
          ],
          chartTitle: "Risk of COVID-19 hospitalization compared to White (NH)",
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
      variableFullDisplayName: "COVID-19 vaccinations",
      variableDefinition: `For the national level and most states this indicates people who have received at least one dose of a COVID-19 vaccine.`,
      metrics: {
        per100k: {
          metricId: "vaccinated_per_100k",
          fullCardTitleName: "COVID-19 vaccinations per 100k people",
          chartTitle: "COVID-19 vaccinations per 100k people",
          mobileChartTitle: ["COVID-19 vaccinations", "per 100k people"],
          trendsCardTitleName: "Rates of COVID-19 vaccinations over time",
          shortLabel: "COVID-19 vaccinations per 100k",
          type: "per100k",
        },
        age_adjusted_ratio: {
          metricId: "vaccinated_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted ratio of COVID-19 vaccination compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
        pct_relative_inequity: {
          metricId: "vaccinated_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequitable distribution of COVID-19 vaccinations",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        pct_share: {
          metricId: "vaccinated_pct_share",
          fullCardTitleName: "Share of total COVID-19 vaccinations",
          chartTitle: "Share of total COVID-19 vaccinations with unknown",
          trendsCardTitleName:
            "Inequitable share of COVID-19 vaccinations over time",

          unknownsVegaLabel: "% unknown",
          shortLabel: "% of vaccinations",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total COVID-19 vaccinations",
            mobileChartTitle: [
              "Population vs distribution of",
              "total COVID-19 vaccinations",
            ],
            metricId: "vaccine_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "vaccinated_share_of_known",
            fullCardTitleName: "Share of total COVID-19 vaccinations",
            shortLabel: "% of vaccinations",
            type: "pct_share",
          },
          secondaryPopulationComparisonMetric: {
            metricId: "acs_vaccine_population_pct",
            fullCardTitleName: "Population percentage According to ACS",
            shortLabel: "pop. % according to acs",
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
          fullCardTitleName: "Share of total suicides",
          chartTitle: "Share of total suicides with unknown",
          trendsCardTitleName: "Inequitable share of suicide over time",
          shortLabel: "% of suicides",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle: "Population vs distribution of total suicide cases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total suicide cases",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "suicide_per_100k",
          fullCardTitleName: "Suicides per 100k people",
          chartTitle: "Suicides per 100k people",
          mobileChartTitle: ["Suicides", "per 100k people"],
          trendsCardTitleName: "Rates of suicide over time",
          shortLabel: "suicides per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "suicide_pct_relative_inequity",
          fullCardTitleName: "historical data for suicide inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "suicide_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of suicide compared to White (NH)",
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
      variableFullDisplayName: "Depression cases",
      variableDefinition: `Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.`,
      surveyCollectedData: true,

      metrics: {
        pct_share: {
          metricId: "depression_pct_share",
          fullCardTitleName: "Share of total depression cases",
          trendsCardTitleName: "Inequitable share of depression over time",
          chartTitle: "Share of total depression cases with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle: "Population vs distribution of total depression cases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total depression",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "depression_per_100k",
          fullCardTitleName: "Cases of depression per 100k people",
          chartTitle: "Cases of depression per 100k people",
          mobileChartTitle: ["Cases of depression", "per 100k people"],
          trendsCardTitleName: "Rates of depression over time",
          shortLabel: "cases of depression per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "depression_pct_relative_inequity",
          fullCardTitleName: "historical data for depression inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "depression_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of depression compared to White (NH)",
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
      variableFullDisplayName: "Excessive drinking cases",
      variableDefinition: `Adults who reported binge drinking (four or more [females] or five or more [males] drinks on one occasion in the past 30 days) or heavy drinking (eight or more [females] or 15 or more [males] drinks per week).`,
      surveyCollectedData: true,

      metrics: {
        pct_share: {
          metricId: "excessive_drinking_pct_share",
          fullCardTitleName: "Share of all excessive drinking cases",
          trendsCardTitleName:
            "Inequitable share of excessive drinking over time",
          chartTitle: "Share of all excessive drinking cases with unknown",
          shortLabel: "% of all cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total excessive drinking cases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total excessive drinking cases",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "excessive_drinking_per_100k",
          fullCardTitleName: "Cases of excessive drinking per 100k people",
          chartTitle: "Excessive drinking cases per 100k people",
          mobileChartTitle: ["Excessive drinking cases", "per 100k people"],
          trendsCardTitleName: "Rates of excessive drinking over time",
          shortLabel: "cases of excessive drinking per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "excessive_drinking_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequity in excessive drinking",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "excessive_drinking_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of excessive drinking compared to White (NH)",
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
      variableDisplayName: "Non-medical drugs",
      variableFullDisplayName: "Non-medical drug use",
      variableDefinition: `Adults who reported using prescription drugs non-medically (including pain relievers, stimulants, sedatives) or illicit drugs (excluding cannabis) in the last 12 months. Note: This data type includes both of the other opioid-related data types: “Non-medical use of prescription opioids” and “Use of Illicit opioids”.`,
      surveyCollectedData: true,

      metrics: {
        pct_share: {
          metricId: "non_medical_drug_use_pct_share",
          fullCardTitleName: "Share of total non-medical drug use",
          trendsCardTitleName:
            "Inequitable share of non-medical drug use over time",
          chartTitle: "Share of total non-medical drug use with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total non-medical drug use",
            mobileChartTitle: [
              "Population vs distribution of",
              "total non-medical drug use",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "non_medical_drug_use_per_100k",
          fullCardTitleName: "Cases of non-medical drug use per 100k people",
          chartTitle: "Non-medical drug use per 100k people",
          mobileChartTitle: ["Non-medical drug use", "per 100k people"],
          trendsCardTitleName: "Rates of non-medical drug use over time",
          shortLabel: "cases of non-medical drug use per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "non_medical_drug_use_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequity in non-medical drug use",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "non_medical_drug_use_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of non-medical drug use compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
    {
      variableId: "non_medical_rx_opioid_use",
      variableDisplayName: "Non-medical prescription opioids",
      variableFullDisplayName: "Non-medical prescription opioid use",
      variableDefinition: `Adults who reported using illicit opioids. Note: This is a subset of the “Non-medical drug use” data type.`,
      surveyCollectedData: true,

      metrics: {
        pct_share: {
          metricId: "non_medical_rx_opioid_use_pct_share",
          fullCardTitleName:
            "Share of total Non-medical prescription opioid use",
          trendsCardTitleName:
            "Inequitable share of non-medical prescription opioid use over time",
          chartTitle:
            "Share of total non-medical prescription opioid use with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total non-medical prescription opioid use",
            mobileChartTitle: [
              "Population vs distribution of",
              "total non-medical prescription opioid use",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "non_medical_rx_opioid_use_per_100k",
          fullCardTitleName:
            "Cases of Non-medical prescription opioid use per 100k people",
          chartTitle: "Non-medical prescription opioid use per 100k people",
          mobileChartTitle: [
            "Non-medical prescription opioid use",
            "per 100k people",
          ],
          trendsCardTitleName:
            "Rates of non-medical prescription opioid use over time",
          shortLabel: "cases of non-medical rx opioid use per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "non_medical_rx_opioid_use_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequity in non-medical prescription opioid use",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "non_medical_rx_opioid_use_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of Non-medical prescription opioid use compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
    {
      variableId: "illicit_opioid_use",
      variableDisplayName: "Illicit opioids",
      variableFullDisplayName: "Illicit opioid use",
      variableDefinition: `Adults who reported using prescription opioids non-medically. Note: This is a subset of the “Non-medical drug use” data type.`,
      surveyCollectedData: true,

      metrics: {
        pct_share: {
          metricId: "illicit_opioid_use_pct_share",
          fullCardTitleName: "Share of total illicit opioid use",
          trendsCardTitleName:
            "Inequitable share of illicit opioid use over time",
          chartTitle: "Share of total illicit opioid use with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total illicit opioid use",
            mobileChartTitle: [
              "Population vs distribution of",
              "total illicit opioid use",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "illicit_opioid_use_per_100k",
          fullCardTitleName: "Cases of illicit opioid use per 100k people",
          chartTitle: "Illicit opioid use per 100k people",
          mobileChartTitle: ["Illicit opioid use", "per 100k people"],
          trendsCardTitleName: "Rates of illicit opioid use over time",
          shortLabel: "cases of illicit opioid use per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "illicit_opioid_use_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequity in illicit opioid use",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "illicit_opioid_use_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of illicit opioid use compared to White (NH)",
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
      variableFullDisplayName: "Frequent mental distress cases",
      variableDefinition: `Adults who reported their mental health was not good 14 or more days in the past 30 days.`,
      surveyCollectedData: true,

      metrics: {
        pct_share: {
          metricId: "frequent_mental_distress_pct_share",
          fullCardTitleName: "Share of all frequent mental distress cases",
          trendsCardTitleName:
            "Inequitable share of frequent mental distress over time",
          chartTitle:
            "Share of all frequent mental distress cases with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total frequent mental distress cases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total frequent mental distress",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "frequent_mental_distress_per_100k",
          fullCardTitleName: "Frequent mental distress cases per 100k people",
          chartTitle: "Frequent mental distress cases per 100k people",
          mobileChartTitle: [
            "Frequent mental distress cases",
            "per 100k people",
          ],
          trendsCardTitleName: "Rates of frequent mental distress over time",
          shortLabel: "frequent mental distress cases per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "frequent_mental_distress_pct_relative_inequity",
          fullCardTitleName:
            "historical data for frequent mental distress inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "frequent_mental_distress_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of frequent mental distress compared to White (NH)",
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
          fullCardTitleName: "Share of total diabetes cases",
          trendsCardTitleName: "Inequitable share of diabetes over time",
          chartTitle: "Share of total diabetes cases with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle: "Population vs distribution of total diabetes cases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total diabetes cases",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "diabetes_per_100k",
          fullCardTitleName: "Diabetes cases per 100k people",
          chartTitle: "Diabetes cases per 100k people",
          mobileChartTitle: ["Diabetes", "per 100k people"],
          trendsCardTitleName: "Rates of diabetes over time",
          shortLabel: "diabetes cases per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "diabetes_pct_relative_inequity",
          fullCardTitleName: "historical data for diabetes inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "diabetes_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of diabetes compared to White (NH)",
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
          fullCardTitleName: "Share of total COPD cases",
          trendsCardTitleName: "Inequitable share of COPD over time",
          chartTitle: "Share of total COPD cases with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle: "Population vs distribution of total COPD cases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total COPD cases",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        per100k: {
          metricId: "copd_per_100k",
          fullCardTitleName: "COPD cases per 100k people",
          chartTitle: "COPD cases per 100k people",
          mobileChartTitle: ["COPD cases", "per 100k people"],
          trendsCardTitleName: "Rates of COPD over time",
          shortLabel: "COPD cases per 100k",
          type: "per100k",
        },
        pct_relative_inequity: {
          metricId: "copd_pct_relative_inequity",
          fullCardTitleName: "historical data for COPD inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "copd_ratio_age_adjusted",
          fullCardTitleName: "Age-adjusted risk of COPD compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],

  health_insurance: [
    {
      variableId: "health_insurance",
      variableDisplayName: "Uninsured individuals",
      variableFullDisplayName: "Uninsured individuals",
      variableDefinition: `Health insurance coverage in the ACS and other Census Bureau surveys define coverage to
        include plans and programs that provide comprehensive health coverage. Plans that provide
        insurance only for specific conditions or situations such as cancer and long-term care policies
        are not considered comprehensive health coverage. Likewise, other types of insurance like
        dental, vision, life, and disability insurance are not considered comprehensive health
        insurance coverage.`,
      metrics: {
        per100k: {
          metricId: "health_insurance_per_100k",
          fullCardTitleName: "Uninsured individuals per 100k people",
          chartTitle: "Uninsured individuals per 100k people",
          mobileChartTitle: ["Uninsured individuals", "per 100k people"],
          trendsCardTitleName: "Rates of uninsurance over time",
          shortLabel: "uninsured individuals per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "health_insurance_pct_share",
          fullCardTitleName: "Share of uninsured individuals",
          trendsCardTitleName: "Inequitable share of uninsurance over time",
          chartTitle: "Share of uninsured individuals with unknown",
          shortLabel: "% of uninsured",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total uninsured individuals",
            mobileChartTitle: [
              "Population vs distribution of",
              "total uninsured individuals",
            ],
            metricId: "health_insurance_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "health_insurance_pct_relative_inequity",
          fullCardTitleName: "historical data for inequity in uninsurance",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "health_insurance_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of being uninsured compared to White (NH)",
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
      variableFullDisplayName: "Individuals below the poverty line",
      variableDefinition: `Following the Office of Management and Budget's (OMB) Statistical Policy Directive 14, the Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using the Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps).`,
      metrics: {
        per100k: {
          metricId: "poverty_per_100k",
          fullCardTitleName:
            "Individuals below the poverty line per 100k people",
          chartTitle: "Individuals below the poverty line per 100k people",
          mobileChartTitle: [
            "Individuals below the poverty line",
            "per 100k people",
          ],
          trendsCardTitleName: "Rates of poverty over time",
          shortLabel: "individuals below the poverty line per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "poverty_pct_share",
          fullCardTitleName: "Share Of Poverty",
          trendsCardTitleName: "Inequitable share of poverty over time",
          chartTitle: "Share of poverty with unknown",
          shortLabel: "% of impoverished",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total individuals below the poverty line",
            mobileChartTitle: [
              "Population vs distribution of",
              "total individuals below the provery line",
            ],
            metricId: "poverty_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "poverty_pct_relative_inequity",
          fullCardTitleName: "historical data for poverty inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "poverty_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of poverty compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  preventable_hospitalizations: [
    {
      variableId: "preventable_hospitalizations",
      variableDisplayName: "Preventable hospitalizations",
      variableFullDisplayName: "Preventable hospitalizations",
      variableDefinition: `Discharges following hospitalization for diabetes with short- or long-term complications, uncontrolled diabetes without complications, diabetes with lower-extremity amputation, chronic obstructive pulmonary disease, angina without a procedure, asthma, hypertension, heart failure, dehydration, bacterial pneumonia or urinary tract infection per 100,000 Medicare beneficiaries ages 18 and older continuously enrolled in Medicare fee-for-service Part A.`,
      metrics: {
        per100k: {
          metricId: "preventable_hospitalizations_per_100k",
          fullCardTitleName: "Preventable hospitalizations per 100k people",
          chartTitle: "Preventable hospitalizations per 100k people",
          mobileChartTitle: ["Preventable hospitalizations", "per 100k people"],
          trendsCardTitleName:
            "Rates of preventable hospitalizations over time",
          shortLabel: "preventable hospitalizations per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "preventable_hospitalizations_pct_share",
          fullCardTitleName: "Share of all preventable hospitalizations",
          trendsCardTitleName:
            "Inequitable share of preventable hospitalizations over time",
          chartTitle: "Share of all preventable hospitalizations with unknown",
          shortLabel: "% of hospitalizations",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total preventable hospitalizations",
            mobileChartTitle: [
              "Population vs distribution of",
              "total preventable hospitalizations",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "preventable_hospitalizations_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequity in preventable hospitalizations",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "preventable_hospitalizations_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of preventable Hospitalization compared to White (NH)",
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
      variableFullDisplayName: "Care avoidance due to cost",
      variableDefinition: `Adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost.`,
      surveyCollectedData: true,

      metrics: {
        per100k: {
          metricId: "avoided_care_per_100k",
          fullCardTitleName:
            "Individuals Who Avoided Care Due to Cost per 100k people",
          chartTitle: "Care avoidance due to cost per 100k people",
          mobileChartTitle: ["Care avoidance due to cost", "per 100k people"],
          trendsCardTitleName: "Rates of care avoidance over time",
          shortLabel: "individuals who avoided care per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "avoided_care_pct_share",
          fullCardTitleName: "Share of all Care avoidance due to cost",
          trendsCardTitleName: "Inequitable share of care avoidance over time",
          chartTitle: "Share of all care avoidance due to cost with unknown",
          shortLabel: "% of avoidance",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total care avoidance due to cost",
            mobileChartTitle: [
              "Population vs distribution of",
              "total care avoidance due to cost",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "avoided_care_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequitable avoidance of care",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "avoided_care_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of care avoidance due to cost compared to White (NH)",
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
      variableFullDisplayName: "Asthma cases",
      surveyCollectedData: true,

      variableDefinition: `Adults who reported being told by a health professional that they currently have asthma.`,
      metrics: {
        per100k: {
          metricId: "asthma_per_100k",
          fullCardTitleName: "Individuals with asthma per 100k people",
          chartTitle: "Asthma cases per 100k people",
          mobileChartTitle: ["Asthma cases", "per 100k people"],
          trendsCardTitleName: "Rates of asthma over time",
          shortLabel: "asthma per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "asthma_pct_share",
          fullCardTitleName: "Share of all asthma cases",
          trendsCardTitleName: "Inequitable share of asthma over time",
          chartTitle: "Share of all asthma cases with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle: "Population vs distribution of total asthma cases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total total asthma cases",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "asthma_pct_relative_inequity",
          fullCardTitleName: "historical data for asthma inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "asthma_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of asthma compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  cardiovascular_diseases: [
    {
      variableId: "cardiovascular_diseases",
      variableDisplayName: "Cardiovascular diseases",
      variableFullDisplayName: "Cases of cardiovascular diseases",
      surveyCollectedData: true,

      variableDefinition: `Adults who reported being told by a health professional that they had angina or coronary heart disease; a heart attack or myocardial infarction; or a stroke.`,
      metrics: {
        per100k: {
          metricId: "cardiovascular_diseases_per_100k",
          fullCardTitleName: "Cases of cardiovascular diseases per 100k people",
          chartTitle: "Cases of cardiovascular diseases per 100k people",
          mobileChartTitle: [
            "Cases of cardiovascular diseases",
            "per 100k people",
          ],
          trendsCardTitleName: "Rates of cardiovascular diseases over time",
          shortLabel: "cases of cardiovascular diseases per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "cardiovascular_diseases_pct_share",
          fullCardTitleName: "Share of all cases of cardiovascular diseases",
          trendsCardTitleName:
            "Inequitable share of cardiovascular diseases over time",
          chartTitle:
            "Share of all cases of cardiovascular diseases with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total cases of cardiovascular diseases",
            mobileChartTitle: [
              "Population vs distribution of",
              "total cases of cardiovascular diseases",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "cardiovascular_diseases_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequity distribution of cardiovascular diseases",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "cardiovascular_diseases_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of cardiovascular diseases compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  chronic_kidney_disease: [
    {
      variableId: "chronic_kidney_disease",
      variableDisplayName: "Chronic kidney disease",
      surveyCollectedData: true,

      variableFullDisplayName: "Cases of chronic kidney disease",
      variableDefinition: `Adults who reported being told by a health professional that they have kidney disease not including kidney stones, bladder infection or incontinence.`,
      metrics: {
        per100k: {
          metricId: "chronic_kidney_disease_per_100k",
          fullCardTitleName: "Cases of chronic kidney disease per 100k people",
          chartTitle: "Chronic kidney disease per 100k people",
          mobileChartTitle: ["Chronic kidney disease", "per 100k people"],
          trendsCardTitleName: "Rates of chronic kidney disease over time",
          shortLabel: "cases of chronic kidney disease per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "chronic_kidney_disease_pct_share",
          fullCardTitleName: "Share of all chronic kidney disease cases",
          trendsCardTitleName:
            "Inequitable share of chronic kidney disease over time",
          chartTitle: "Share of all chronic kidney disease cases with unknown",
          shortLabel: "% of cases",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total cases of chronic kidney disease",
            mobileChartTitle: [
              "Population vs distribution of",
              "total cases of chronic kidney disease",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "chronic_kidney_disease_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequitable distribution of chronic kidney disease",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "chronic_kidney_disease_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted risk of chronic kidney disease compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  voter_participation: [
    {
      variableId: "voter_participation",
      variableDisplayName: "Voter participation",
      variableFullDisplayName: "Voter participation",
      surveyCollectedData: true,

      variableDefinition: `U.S. citizens ages 18 and older who voted in either the last presidential election, the last midterm national election, or the average of both where that data is available.`,
      metrics: {
        per100k: {
          metricId: "voter_participation_per_100k",
          fullCardTitleName: "Participating Voters per 100k people",
          chartTitle: "Voter participation per 100k people",
          mobileChartTitle: ["Voter participation", "per 100k people"],
          trendsCardTitleName: "Rates of voter participation over time",
          shortLabel: "voters per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "voter_participation_pct_share",
          fullCardTitleName: "Share of all voter participation",
          trendsCardTitleName:
            "Inequitable share of voter participation over time",
          chartTitle: "Share of all voter participation with unknown",
          shortLabel: "% of voters",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total voter participation",
            mobileChartTitle: [
              "Population vs distribution of",
              "total voter participation",
            ],
            metricId: "brfss_population_pct",
            fullCardTitleName: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "voter_participation_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequitable voter participation",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "voter_participation_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted voter participation ratio compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
  women_in_legislative_office: [
    {
      variableId: "women_us_congress",
      variableDisplayName: "Women in US Congress",
      variableFullDisplayName: "Women in US Congress",
      surveyCollectedData: true,
      timeSeriesData: true,
      variableDefinition: `Individuals identifying as women who are currently serving in the Congress of the United States, including members of the U.S. Senate and members, territorial delegates, and resident commissioners of the U.S. House of Representatives. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.`,
      metrics: {
        per100k: {
          metricId: "pct_share_of_us_congress",
          fullCardTitleName: "Percentage of US Congress members",
          trendsCardTitleName:
            "Yearly rates of U.S. Congress members identifying as women",
          chartTitle: "Percentage of women US Congress members",
          mobileChartTitle: ["Percentage of women US", "Congress members"],
          shortLabel: "% of US congress",
          type: "pct_share",
        },
        pct_share: {
          metricId: "pct_share_of_women_us_congress",
          fullCardTitleName: "Percent share of women US Congress members",
          trendsCardTitleName:
            "Inequitable share of women in U.S. Congress over time",
          chartTitle: "Percent share of women US Congress members with unknown",
          shortLabel: "% of women members",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total women in US Congress",
            mobileChartTitle: [
              "Population vs distribution of",
              "total women in US congress",
            ],
            metricId: "cawp_population_pct",
            fullCardTitleName: "Total population share (all genders)",
            shortLabel: `${populationPctShortLabel} (all genders)`,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "pct_share_of_women_us_congress",
            fullCardTitleName: "Percent share of women US Congress members",
            shortLabel: "% of women members",
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "pct_share_of_us_congress_relative_inequity",
          fullCardTitleName:
            "historical data for inequitable representation of women in US Congress",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "women_us_congress_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted representation ratio of women in U.S. Congress compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
    {
      variableId: "women_state_legislatures",
      variableDisplayName: "Women in state legislatures", // DATA TOGGLE
      variableFullDisplayName: "Women in state legislatures", // TABLE TITLE,
      surveyCollectedData: true,
      variableDefinition: `Individuals identifying as women currently serving in their state or territory’s legislature. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.
      `,
      metrics: {
        per100k: {
          metricId: "women_state_leg_pct",
          fullCardTitleName: "Percentage of state legislators", // MAP CARD HEADING, SIMPLE BAR TITLE, MAP INFO ALERT, TABLE COL HEADER, HI/LOW DROPDOWN FOOTNOTE
          chartTitle: "Percentage of women state legislators",
          mobileChartTitle: ["Percentage of women in state", "legislators"],
          trendsCardTitleName: "Rates of women in state legislatures over time",
          shortLabel: "% of state legislators identifying as women", // SIMPLE BAR LEGEND, MAP LEGEND, INFO BOX IN MAP CARD
          type: "pct_incidence",
        },
        pct_share: {
          metricId: "women_state_leg_pct_share",
          fullCardTitleName: "Percent share of women state legislators", // UNKNOWNS MAP TITLE, DISPARITY BAR TITLE
          trendsCardTitleName:
            "Inequitable share of women in state legislatures over time",
          chartTitle: "Percent share of women state legislators with unknown",
          shortLabel: "% of women legislators", // DISPARITY BAR LEGEND
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total women in state legislatures",
            mobileChartTitle: [
              "Population vs distribution of",
              "total women in state legislatures",
            ],
            metricId: "cawp_population_pct",
            fullCardTitleName: "Total population share (all genders)", // TABLE COLUMN HEADER
            shortLabel: `${populationPctShortLabel} (all genders)`, // DISPARITY BAR LEGEND/AXIS
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "women_state_leg_pct_share",
            fullCardTitleName: "Percent share of women state legislators", // TABLE COL HEADER
            shortLabel: "% of women legislators", // UNKNOWNS MAP ALERT, DISPARITY BAR LABELS/AXIS
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "women_state_leg_pct_relative_inequity",
          fullCardTitleName:
            "historical data for inequitable representation of women in state legislature",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "women_state_leg_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted representation ratio of women in state legislatures compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],

  incarceration: [
    {
      variableId: "prison",
      variableDisplayName: "Prison",
      variableFullDisplayName: "Individuals in prison",
      surveyCollectedData: true,
      variableDefinition: `Individuals of any age, including children, under the jurisdiction of an adult prison facility. ‘Age’ reports at the national level include only the subset of this jurisdictional population who have been sentenced to one year or more, which accounted for 97% of the total U.S. prison population in 2020. For all national reports, this rate includes both state and federal prisons. For state and territory level reports, only the prisoners under the jurisdiction of that geography are included. For county level reports, Vera reports the
      number of people incarcerated under the jurisdiction of a state prison system on charges arising from a criminal case in that specific county, which are not available in every state. The county of court commitment is generally where a person was convicted; it is not necessarily the person’s county of residence, and may not even be the county where the crime was committed, but nevertheless is likely to be both.  AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Prisons are longer-term facilities run by the state or the federal government that typically holds felons and persons with sentences of more than one year. Definitions may vary by state.`,
      metrics: {
        per100k: {
          metricId: "prison_per_100k",
          fullCardTitleName: "Individuals in prison per 100k people",
          chartTitle: "Individuals in prison per 100k people",
          mobileChartTitle: ["Individuals in prison", "per 100k people"],
          trendsCardTitleName: "Rates of prison incarceration over time",
          shortLabel: "individuals in prison per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "prison_pct_share",
          fullCardTitleName: "Percent share of total prison population",
          trendsCardTitleName:
            "Inequitable share of prison incarceration over time",
          chartTitle: "Percent share of total prison population with unknown",
          shortLabel: "% of prison pop.",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total individuals in prison",
            mobileChartTitle: [
              "Population vs distribution of",
              "total total individuals in prison",
            ],
            metricId: "population_pct",
            fullCardTitleName: "Total population share",
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "prison_pct_share",
            fullCardTitleName: "Percent share of total prison population",
            shortLabel: "% of total prison population",
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "prison_pct_relative_inequity",
          fullCardTitleName: "historical data for prison inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "prison_ratio_age_adjusted",
          fullCardTitleName:
            "Age-adjusted imprisonment ratio compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },

    {
      variableId: "jail",
      variableDisplayName: "Jail",
      variableFullDisplayName: "Individuals in jail",
      surveyCollectedData: true,
      variableDefinition: `Individuals of any age, including children, confined in a local, adult jail facility. AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Jails are locally operated short-term facilities that hold inmates awaiting trial or sentencing or both, and inmates sentenced to a term of less than one year, typically misdemeanants. Definitions may vary by state.`,
      metrics: {
        per100k: {
          metricId: "jail_per_100k",
          fullCardTitleName: "Individuals in jail per 100k people",
          chartTitle: "Individuals in jail per 100k people",
          mobileChartTitle: ["Individuals in jail", "per 100k people"],
          trendsCardTitleName: "Rates of jail incarceration over time",
          shortLabel: "Individuals in jail per 100k",
          type: "per100k",
        },
        pct_share: {
          metricId: "jail_pct_share",
          fullCardTitleName: "Percent share of total jail population",
          trendsCardTitleName:
            "Inequitable share of jail incarceration over time",
          chartTitle: "Percent share of total jail population with unknown",
          shortLabel: "% of total jail population",
          type: "pct_share",
          populationComparisonMetric: {
            chartTitle:
              "Population vs distribution of total individuals in jail",
            mobileChartTitle: [
              "Population vs distribution of",
              "total individuals in jail",
            ],
            metricId: "population_pct",
            fullCardTitleName: "Total population share",
            shortLabel: populationPctShortLabel,
            type: "pct_share",
          },
          knownBreakdownComparisonMetric: {
            metricId: "jail_pct_share",
            fullCardTitleName: "Percent share of total jail population",
            shortLabel: "% of total jail population",
            type: "pct_share",
          },
        },
        pct_relative_inequity: {
          metricId: "jail_pct_relative_inequity",
          fullCardTitleName: "historical data for jail inequity",
          shortLabel: "% relative inequity",
          type: "pct_relative_inequity",
        },
        age_adjusted_ratio: {
          metricId: "jail_ratio_age_adjusted",
          fullCardTitleName: "Age-adjusted jailed ratio compared to White (NH)",
          shortLabel: "",
          type: "ratio",
        },
      },
    },
  ],
};
