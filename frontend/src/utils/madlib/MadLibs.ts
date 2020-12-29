import { USA_FIPS, FIPS_MAP } from "./Fips";

// Map of phrase segment index to its selected value
export type PhraseSelections = Record<number, string>;

// Map of phrase selection ID to the display value
export type PhraseSelector = Record<string, string>;

// Each phrase segment of the mad lib is either a string of text
// or a map of IDs to string options that can fill in a blank

export type PhraseSegment = string | PhraseSelector;

export type MadLibId = "disparity" | "comparegeos" | "comparevars" | "dump";

export interface MadLib {
  readonly id: MadLibId;
  readonly phrase: PhraseSegment[];
  readonly defaultSelections: PhraseSelections;
  readonly activeSelections: PhraseSelections;
}

// TODO - if value are FIPs, we're not getting full display name for counties
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
  | "obesity"
  | "asthma"
  | "copd"
  | "insurance";

// TODO- investigate type check error to see if we can remove
// @ts-ignore
const DROPDOWN_VAR: Record<DropdownVarId, string> = {
  covid: "COVID-19",
  diabetes: "diabetes",
  obesity: "[coming soon] obesity",
  asthma: "[coming soon] asthma",
  copd: "COPD",
  insurance: "[coming soon] insurance type",
};

const MADLIB_LIST: MadLib[] = [
  {
    id: "disparity",
    phrase: ["Tell me about disparities for", DROPDOWN_VAR, "in", FIPS_MAP],
    defaultSelections: { 1: "covid", 3: USA_FIPS },
    activeSelections: { 1: "covid", 3: USA_FIPS },
  },
  {
    id: "comparegeos",
    phrase: [
      "Compare ",
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
    phrase: ["Show ", DROPDOWN_VAR, " and ", DROPDOWN_VAR, " in ", FIPS_MAP],
    defaultSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS }, // 13 is Georgia
    activeSelections: { 1: "diabetes", 3: "covid", 5: USA_FIPS }, // 13 is Georgia
  },
  {
    id: "dump",
    phrase: ["Show me additional chart options"],
    defaultSelections: {},
    activeSelections: {},
  },
];

export { MADLIB_LIST, getMadLibPhraseText };
