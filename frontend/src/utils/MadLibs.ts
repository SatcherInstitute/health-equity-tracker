import {
  type DropdownVarId,
  METRIC_CONFIG,
  type DataTypeConfig,
} from '../data/config/MetricConfig'
import { FIPS_MAP, GEORGIA_FIPS, USA_FIPS } from '../data/utils/Fips'

// Map of phrase segment index to its selected value
export type PhraseSelections = Record<number, string>

// Map of phrase selection ID to the display value
export type PhraseSelector = Record<string, string>

// Each phrase segment of the mad lib is either a string of text
// or a map of IDs to string options that can fill in a blank
export type PhraseSegment = string | PhraseSelector

export type MadLibId = 'disparity' | 'comparegeos' | 'comparevars'

export const MADLIB_MODE_MAP: Record<string, MadLibId> = {
  Off: 'disparity',
  Places: 'comparegeos',
  Topics: 'comparevars',
}

// wording used for determinant categories in the selectable dropdown on /exploredata
export type CategoryId =
  | 'HIV'
  | `Black Women's Health`
  | 'COVID-19'
  | 'Chronic Disease'
  | 'Behavioral Health'
  | 'Political Determinants of Health'
  | 'Social Determinants of Health'

export interface MadLib {
  readonly id: MadLibId
  readonly phrase: PhraseSegment[]
  readonly defaultSelections: PhraseSelections
  readonly activeSelections: PhraseSelections
}

function getMadLibPhraseText(madLib: MadLib): string {
  let madLibText = ''
  madLib.phrase.forEach((phraseSegment, index) => {
    if (typeof phraseSegment === 'string') {
      madLibText += phraseSegment
    } else {
      const phraseSelector = phraseSegment
      const selectionKey: string = madLib.activeSelections[index]
        ? madLib.activeSelections[index]
        : madLib.defaultSelections[index]
      madLibText += ' ' + phraseSelector[selectionKey] + ' '
    }
  })
  return madLibText
}

/* Returns a copy of the MadLib with with an updated value in the given phrase segment index */
export function getMadLibWithUpdatedValue(
  originalMadLib: MadLib,
  phraseSegmentIndex: number,
  newValue: DropdownVarId | string // condition or numeric-string FIPS code
) {
  const updatePhraseSelections: PhraseSelections = {
    ...originalMadLib.activeSelections,
  }
  updatePhraseSelections[phraseSegmentIndex] = newValue

  return {
    ...originalMadLib,
    activeSelections: updatePhraseSelections,
  }
}

export function getPhraseValue(madLib: MadLib, segmentIndex: number): string {
  const segment = madLib.phrase[segmentIndex]
  return typeof segment === 'string'
    ? segment
    : madLib.activeSelections[segmentIndex]
}

/* Returns an array of all currently selected conditions.
If a condition contains multiple data types, they are
treated as individual items  */
export function getSelectedConditions(madLib: MadLib) {
  if (madLib.activeSelections[1] === DEFAULT) return []

  const condition1array: DataTypeConfig[] =
    METRIC_CONFIG[getPhraseValue(madLib, 1) as DropdownVarId]
  // get 2nd condition if in compare var mode
  const condition2array: DataTypeConfig[] =
    madLib.id === 'comparevars'
      ? METRIC_CONFIG[getPhraseValue(madLib, 3) as DropdownVarId]
      : []

  // make a list of conditions and sub-conditions, including #2 if it's unique
  return condition2array?.length && condition2array !== condition1array
    ? [...condition1array, ...condition2array]
    : condition1array
}

export type DefaultDropdownVarId = 'default'
export const DEFAULT: DefaultDropdownVarId = 'default'

const DROPDOWN_VAR: Record<DropdownVarId | DefaultDropdownVarId, string> = {
  default: 'select a topic',
  asthma: 'Asthma',
  avoided_care: 'Care Avoidance Due to Cost',
  cardiovascular_diseases: 'Cardiovascular Diseases',
  chronic_kidney_disease: 'Chronic Kidney Disease',
  copd: 'COPD',
  covid_vaccinations: 'COVID-19 Vaccinations',
  covid: 'COVID-19',
  depression: 'Depression',
  diabetes: 'Diabetes',
  excessive_drinking: 'Excessive Drinking',
  frequent_mental_distress: 'Frequent Mental Distress',
  health_insurance: 'Uninsured Individuals',
  hiv_black_women: 'HIV (Black Women)',
  hiv_care: 'Linkage to HIV Care',
  hiv_prep: 'PrEP Coverage',
  hiv_stigma: 'HIV Stigma',
  hiv: 'HIV',
  incarceration: 'Incarceration',
  poverty: 'Poverty',
  preventable_hospitalizations: 'Preventable Hospitalization',
  substance: 'Opioid and Other Substance Misuse',
  suicide: 'Suicide',
  voter_participation: 'Voter Participation',
  women_in_gov: 'Women in Government',
}

export const SELECTED_DROPDOWN_OVERRIDES: Partial<
  Record<DropdownVarId, string>
> = {
  hiv_black_women: 'HIV',
  incarceration: 'Incarceration in',
  women_in_gov: 'Women in',
}

export interface Category {
  readonly title: CategoryId
  readonly options: DropdownVarId[]
  readonly definition?: string
}

const CATEGORIES_LIST: Category[] = [
  {
    title: 'HIV',
    definition: '',
    options: ['hiv', 'hiv_care', 'hiv_prep', 'hiv_black_women', 'hiv_stigma'],
  },
  {
    title: 'Chronic Disease',
    definition: '',
    options: [
      'diabetes',
      'copd',
      'asthma',
      'cardiovascular_diseases',
      'chronic_kidney_disease',
    ],
  },
  {
    title: 'Behavioral Health',
    definition: '',
    options: [
      'depression',
      'suicide',
      'substance',
      'excessive_drinking',
      'frequent_mental_distress',
    ],
  },
  {
    title: 'COVID-19',
    definition: '',
    options: ['covid', 'covid_vaccinations'],
  },
  {
    title: 'Social Determinants of Health',
    definition: '',
    options: [
      'health_insurance',
      'poverty',
      'preventable_hospitalizations',
      'avoided_care',
    ],
  },
  {
    title: 'Political Determinants of Health',
    definition: '',
    options: ['voter_participation', 'women_in_gov', 'incarceration'],
  },
]

const MADLIB_LIST: MadLib[] = [
  {
    id: 'disparity',
    phrase: ['Investigate rates of', DROPDOWN_VAR, 'in', FIPS_MAP],
    defaultSelections: { 1: DEFAULT, 3: USA_FIPS },
    activeSelections: { 1: DEFAULT, 3: USA_FIPS },
  },
  {
    id: 'comparegeos',
    phrase: [
      'Compare rates of',
      DROPDOWN_VAR,
      'between',
      FIPS_MAP,
      'and',
      FIPS_MAP,
    ],
    defaultSelections: { 1: 'covid', 3: GEORGIA_FIPS, 5: USA_FIPS },
    activeSelections: { 1: 'covid', 3: GEORGIA_FIPS, 5: USA_FIPS },
  },
  {
    id: 'comparevars',
    phrase: [
      'Explore relationships between',
      DROPDOWN_VAR,
      'and',
      DROPDOWN_VAR,
      'in',
      FIPS_MAP,
    ],
    defaultSelections: { 1: 'diabetes', 3: 'covid', 5: USA_FIPS },
    activeSelections: { 1: 'diabetes', 3: 'covid', 5: USA_FIPS },
  },
]

function insertOptionalThe(phraseSelections: PhraseSelections, index: number) {
  return phraseSelections[index + 1] === USA_FIPS ? ' the' : ''
}

export { MADLIB_LIST, getMadLibPhraseText, CATEGORIES_LIST, insertOptionalThe }
