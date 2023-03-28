import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableConfig,
} from "../data/config/MetricConfig";
import { FIPS_MAP, GEORGIA_FIPS, USA_FIPS } from "../data/utils/Fips";

// Map of phrase segment index to its selected value
export type PhraseSelections = Record<number, string>;

// Map of phrase selection ID to the display value
export type PhraseSelector = Record<string, string>;

// Each phrase segment of the mad lib is either a string of text
// or a map of IDs to string options that can fill in a blank
export type PhraseSegment = string | PhraseSelector;

export type MadLibId = "disparity" | "comparegeos" | "comparevars";

// wording used for determinant categories in the selectable dropdown on /exploredata
export type CategoryId =
  | "HIV"
  | "COVID-19"
  | "Chronic Disease"
  | "Behavioral Health"
  | "Political Determinants of Health"
  | "Social Determinants of Health";

export interface MadLib {
  readonly id: MadLibId;
  readonly phrase: PhraseSegment[];
  readonly defaultSelections: PhraseSelections;
  readonly activeSelections: PhraseSelections;
}

function getMadLibPhraseText(madLib: MadLib): string {
  let madLibText = "";
  madLib.phrase.forEach((phraseSegment, index) => {
    if (typeof phraseSegment === "string") {
      madLibText += phraseSegment;
    } else {
      const phraseSelector = phraseSegment as PhraseSelector;
      let selectionKey: string = madLib.activeSelections[index]
        ? madLib.activeSelections[index]
        : madLib.defaultSelections[index];
      madLibText += " " + phraseSelector[selectionKey] + " ";
    }
  });
  return madLibText;
}

/* Returns a copy of the MadLib with with an updated value in the given phrase segment index */
export function getMadLibWithUpdatedValue(
  originalMadLib: MadLib,
  phraseSegementIndex: number,
  newValue: DropdownVarId | string // condition or numeric-string FIPS code
) {
  let updatePhraseSelections: PhraseSelections = {
    ...originalMadLib.activeSelections,
  };
  updatePhraseSelections[phraseSegementIndex] = newValue;
  return {
    ...originalMadLib,
    activeSelections: updatePhraseSelections,
  };
}

export function getPhraseValue(madLib: MadLib, segmentIndex: number): string {
  const segment = madLib.phrase[segmentIndex];
  return typeof segment === "string"
    ? segment
    : madLib.activeSelections[segmentIndex];
}

/* Returns an array of all currently selected conditions.
If a condition contains multiple data types, they are
treated as individual items  */
export function getSelectedConditions(madLib: MadLib) {
  if (madLib.activeSelections[1] === DEFAULT) return [];

  const condition1array: VariableConfig[] =
    METRIC_CONFIG[getPhraseValue(madLib, 1) as DropdownVarId];
  // get 2nd condition if in compare var mode
  const condition2array: VariableConfig[] =
    madLib.id === "comparevars"
      ? METRIC_CONFIG[getPhraseValue(madLib, 3) as DropdownVarId]
      : [];

  // make a list of conditions and sub-conditions, including #2 if it's unique
  return condition2array.length && condition2array !== condition1array
    ? [...condition1array, ...condition2array]
    : condition1array;
}

export type DefaultDropdownVarId = "default";
export const DEFAULT: DefaultDropdownVarId = "default";

const DROPDOWN_VAR: Record<DropdownVarId | DefaultDropdownVarId, string> = {
  default: "select a topic",
  covid_cases: "COVID-19 Cases",
  covid_hospitalizations: "COVID-19 Hospitalizations",
  covid_deaths: "COVID-19 Deaths",
  hiv_diagnoses: "HIV Diagnoses",
  hiv_deaths: "HIV Deaths",
  hiv_prep: "PrEP Coverage",
  diabetes: "Diabetes",
  copd: "COPD",
  health_insurance: "Uninsured Individuals",
  poverty: "Poverty",
  covid_vaccinations: "COVID-19 Vaccinations",
  depression: "Depression",
  suicide: "Suicide",
  substance: "Opioid and Other Substance Misuse",
  excessive_drinking: "Excessive Drinking",
  frequent_mental_distress: "Frequent Mental Distress",
  preventable_hospitalizations: "Preventable Hospitalization",
  avoided_care: "Care Avoidance Due to Cost",
  chronic_kidney_disease: "Chronic Kidney Disease",
  cardiovascular_diseases: "Cardiovascular Diseases",
  asthma: "Asthma",
  voter_participation: "Voter Participation",
  women_in_state_legislature: "Women in State Legislatures",
  women_in_us_congress: "Women in U.S. Congress",
  jail: "Jail Incarceration",
  prison: "Prison Incarceration",
};

export interface Category {
  readonly title: CategoryId;
  readonly options: DropdownVarId[];
  readonly definition?: string;
}

const CATEGORIES_LIST: Category[] = [
  {
    title: "HIV",
    definition: "",
    options: ["hiv_diagnoses", "hiv_deaths", "hiv_prep"],
  },
  {
    title: "COVID-19",
    definition: "",
    options: [
      "covid_cases",
      "covid_hospitalizations",
      "covid_deaths",
      "covid_vaccinations",
    ],
  },
  {
    title: "Political Determinants of Health",
    definition: "",
    options: [
      "voter_participation",
      "women_in_us_congress",
      "women_in_state_legislature",
      "prison",
      "jail",
    ],
  },
  {
    title: "Social Determinants of Health",
    definition: "",
    options: [
      "health_insurance",
      "poverty",
      "preventable_hospitalizations",
      "avoided_care",
    ],
  },
  {
    title: "Chronic Disease",
    definition: "",
    options: [
      "diabetes",
      "copd",
      "asthma",
      "cardiovascular_diseases",
      "chronic_kidney_disease",
    ],
  },
  {
    title: "Behavioral Health",
    definition: "",
    options: [
      "depression",
      "suicide",
      "substance",
      "excessive_drinking",
      "frequent_mental_distress",
    ],
  },
];

const MADLIB_LIST: MadLib[] = [
  {
    id: "disparity",
    phrase: ["Investigate rates of", DROPDOWN_VAR, "in", FIPS_MAP],
    defaultSelections: { 1: DEFAULT, 3: USA_FIPS },
    activeSelections: { 1: DEFAULT, 3: USA_FIPS },
  },
  {
    id: "comparegeos",
    phrase: [
      "Compare rates of",
      DROPDOWN_VAR,
      "between",
      FIPS_MAP,
      "and",
      FIPS_MAP,
    ],
    defaultSelections: { 1: "covid", 3: GEORGIA_FIPS, 5: USA_FIPS },
    activeSelections: { 1: "covid", 3: GEORGIA_FIPS, 5: USA_FIPS },
  },
  {
    id: "comparevars",
    phrase: [
      "Explore relationships between",
      DROPDOWN_VAR,
      "and",
      DROPDOWN_VAR,
      "in",
      FIPS_MAP,
    ],
    defaultSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS },
    activeSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS },
  },
];

function insertOptionalThe(phraseSelections: PhraseSelections, index: number) {
  return phraseSelections[index + 1] === USA_FIPS ? " the" : "";
}

export { MADLIB_LIST, getMadLibPhraseText, CATEGORIES_LIST, insertOptionalThe };
