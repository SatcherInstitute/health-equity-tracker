import { FIPS_MAP, USA_FIPS } from "../data/utils/Fips";

// Map of phrase segment index to its selected value
export type PhraseSelections = Record<number, string>;

// Map of phrase selection ID to the display value
export type PhraseSelector = Record<string, string>;

// Each phrase segment of the mad lib is either a string of text
// or a map of IDs to string options that can fill in a blank

export type PhraseSegment = string | PhraseSelector;

export type MadLibId = "disparity" | "comparegeos" | "comparevars";

export type CategoryId =
  | "COVID-19"
  | "Chronic Disease"
  | "Mental Health"
  | "Social and Behavioral Health";

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
  newValue: string
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

export type DropdownVarId =
  | "covid"
  | "diabetes"
  | "copd"
  | "health_insurance"
  | "poverty"
  | "covid_vaxx"
  | "covid_vaxx_hesitancy"
  | "covid_hospital_utilization"
  | "asthma"
  | "cardiovascular_disease"
  | "social_vulnerability"
  | "highschool_graduation"
  | "tobacco"
  | "food_insecurity"
  | "anxiety"
  | "depression"
  | "suicide"
  | "frequent_mental_distress"
  | "mental_health_providers";

const DROPDOWN_VAR: Record<DropdownVarId, string> = {
  covid: "COVID Outcomes",
  diabetes: "Diabetes",
  copd: "COPD",
  health_insurance: "Uninsured Individuals",
  poverty: "Poverty",
  covid_vaxx: "COVID Vaccination",
  covid_vaxx_hesitancy: "COVID Vaccine Hesitancy",
  covid_hospital_utilization: "COVID Hospital Utilization",
  asthma: "Asthma",
  cardiovascular_disease: "Cardiovascular Disease",
  social_vulnerability: "Social Vulnerability Index",
  highschool_graduation: "High School Graduation Rate",
  tobacco: "Tobacco Use",
  food_insecurity: "Food Insecurity",
  anxiety: "Anxiety",
  depression: "Depression",
  suicide: "Suicide",
  frequent_mental_distress: "Frequent Mental Distress",
  mental_health_providers: "Mental Health Provider Access",
};

/* Update categories and assigned DropdownVarIds here. Update variable and category type definitions at top of file as well. */

export interface Category {
  readonly title: CategoryId;
  readonly options: DropdownVarId[];
}

const CATEGORIES_LIST: Category[] = [
  {
    title: "COVID-19",
    options: [
      "covid",
      "covid_vaxx",
      "covid_vaxx_hesitancy",
      "covid_hospital_utilization",
    ],
  },
  {
    title: "Chronic Disease",
    options: ["diabetes", "copd", "asthma", "cardiovascular_disease"],
  },
  {
    title: "Social and Behavioral Health",
    options: [
      "health_insurance",
      "poverty",
      "social_vulnerability",
      "highschool_graduation",
      "tobacco",
      "food_insecurity",
    ],
  },
  {
    title: "Mental Health",
    options: [
      "anxiety",
      "depression",
      "suicide",
      "frequent_mental_distress",
      "mental_health_providers",
    ],
  },
];

const MADLIB_LIST: MadLib[] = [
  {
    id: "disparity",
    phrase: ["Investigate rates of", DROPDOWN_VAR, "in", FIPS_MAP],
    defaultSelections: { 1: "covid", 3: USA_FIPS },
    activeSelections: { 1: "covid", 3: USA_FIPS },
  },
  {
    id: "comparegeos",
    phrase: [
      "Compare rates of",
      DROPDOWN_VAR,
      " between ",
      FIPS_MAP,
      " and ",
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
      " and ",
      DROPDOWN_VAR,
      " in ",
      FIPS_MAP,
    ],
    defaultSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS }, // 13 is Georgia
    activeSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS }, // 13 is Georgia
  },
];

export { MADLIB_LIST, getMadLibPhraseText, CATEGORIES_LIST };
