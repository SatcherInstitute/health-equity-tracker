import { FIPS_MAP, USA_FIPS } from "../data/utils/Fips";

const CACHE_KEY_DISPARITY = "disparity";
const CACHE_KEY_COMPAREGEOS = "comparegeos";
const CACHE_KEY_COMPAREVARS = "comparevars";

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
  | "Social & Political Determinants of Health";

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

  // cache the new tracker settings for retrieval if user navigates off and back onto the tracker
  localStorage.setItem(
    originalMadLib.id,
    JSON.stringify(updatePhraseSelections)
  );

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
  | "vaccinations";

const DROPDOWN_VAR: Record<DropdownVarId, string> = {
  covid: "COVID-19",
  diabetes: "Diabetes",
  copd: "COPD",
  health_insurance: "Uninsured Individuals",
  poverty: "Poverty",
  vaccinations: "COVID-19 Vaccinations",
};

/* Update categories / DropdownVarIds here; type defs at top of file */

export interface Category {
  readonly title: CategoryId;
  readonly options: DropdownVarId[];
}

const CATEGORIES_LIST: Category[] = [
  {
    title: "COVID-19",
    options: ["covid", "vaccinations"],
  },
  {
    title: "Chronic Disease",
    options: ["diabetes", "copd"],
  },
  {
    title: "Social & Political Determinants of Health",
    options: ["health_insurance", "poverty"],
  },
];

// default settings if user hasn't selected anything and nothing is cached
const GEORGIA_FIPS = "13";
const freshDisparitySettings = { 1: "covid", 3: USA_FIPS };
const freshCompareGeosSettings = { 1: "covid", 3: GEORGIA_FIPS, 5: USA_FIPS };
const freshCompareVarsSettings = { 1: "diabetes", 3: "covid", 5: USA_FIPS };

// if settings are cached, use them; otherwise use fresh settings
const disparitySettings = localStorage.getItem(CACHE_KEY_DISPARITY)
  ? JSON.parse(localStorage.getItem(CACHE_KEY_DISPARITY) as string)
  : freshDisparitySettings;
const compareGeosSettings = localStorage.getItem(CACHE_KEY_COMPAREGEOS)
  ? JSON.parse(localStorage.getItem(CACHE_KEY_COMPAREGEOS) as string)
  : freshCompareGeosSettings;
const compareVarsSettings = localStorage.getItem(CACHE_KEY_COMPAREVARS)
  ? JSON.parse(localStorage.getItem(CACHE_KEY_COMPAREVARS) as string)
  : freshCompareVarsSettings;

const MADLIB_LIST: MadLib[] = [
  {
    id: "disparity",
    phrase: ["Investigate rates of", DROPDOWN_VAR, "in", FIPS_MAP],
    defaultSelections: disparitySettings,
    activeSelections: disparitySettings,
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
    defaultSelections: compareGeosSettings,
    activeSelections: compareGeosSettings,
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
    defaultSelections: compareVarsSettings,
    activeSelections: compareVarsSettings,
  },
];

export { MADLIB_LIST, getMadLibPhraseText, CATEGORIES_LIST };
