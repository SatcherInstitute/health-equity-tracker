import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableConfig,
} from "../data/config/MetricConfig";
import { FIPS_MAP, USA_FIPS } from "../data/utils/Fips";

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
  if (madLib.activeSelections[1] === "default") return [];

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

const DROPDOWN_VAR: Record<DropdownVarId | string, string> = {
  default: "« click to select a topic »",
  covid: "COVID-19",
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
  women_in_legislative_office: "Women in Legislative Office",
  incarceration: "Incarceration",
};

export interface Category {
  readonly title: CategoryId;
  readonly options: DropdownVarId[];
  readonly definition?: string;
}

const CATEGORIES_LIST: Category[] = [
  {
    title: "COVID-19",
    definition: "",
    options: ["covid", "covid_vaccinations"],
  },
  {
    title: "Political Determinants of Health",
    definition: "",
    options: [
      "voter_participation",
      "women_in_legislative_office",
      "incarceration",
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
    defaultSelections: { 1: "default", 3: USA_FIPS },
    activeSelections: { 1: "default", 3: USA_FIPS },
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
    defaultSelections: { 1: "covid", 3: "13", 5: USA_FIPS }, // 13 is Georgia
    activeSelections: { 1: "covid", 3: "13", 5: USA_FIPS }, // 13 is Georgia
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
    defaultSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS }, // 13 is Georgia
    activeSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS }, // 13 is Georgia
  },
];

function insertOptionalThe(phraseSelections: PhraseSelections, index: number) {
  return phraseSelections[index + 1] === "00" ? " the" : "";
}

export { MADLIB_LIST, getMadLibPhraseText, CATEGORIES_LIST, insertOptionalThe };
