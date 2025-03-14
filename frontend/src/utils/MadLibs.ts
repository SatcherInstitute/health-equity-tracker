import type { DropdownVarId } from '../data/config/DropDownIds'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import { BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigBehavioralHealth'
import { CDC_CANCER_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigCancer'
import { CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigChronicDisease'
import {
  COMMUNITY_SAFETY_DROPDOWNIDS,
  COMMUNITY_SAFETY_DROPDOWNIDS_NO_CHR,
} from '../data/config/MetricConfigCommunitySafety'
import { COVID_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigCovidCategory'
import { HIV_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigHivCategory'
import { MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigMaternalHealth'
import { PDOH_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigPDOH'
import {
  MEDICARE_CATEGORY_DROPDOWNIDS,
  MEDICARE_CATEGORY_HIV_AND_CVD_DROPDOWNIDS,
} from '../data/config/MetricConfigPhrma'
import { CANCER_SCREENING_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigPhrmaBrfss'
import { SDOH_CATEGORY_DROPDOWNIDS } from '../data/config/MetricConfigSDOH'
import type {
  DataTypeConfig,
  DataTypeId,
} from '../data/config/MetricConfigTypes'

import { SHOW_NEW_MATERNAL_MORTALITY } from '../data/providers/MaternalMortalityProvider'
import { SHOW_CANCER_SCREENINGS } from '../data/providers/PhrmaBrfssProvider'
import { SHOW_PHRMA_MENTAL_HEALTH } from '../data/providers/PhrmaProvider'
import { GEORGIA_FIPS, USA_FIPS } from '../data/utils/ConstantsGeography'
import { Fips } from '../data/utils/Fips'
import { FIPS_MAP } from '../data/utils/FipsData'

const SHOW_CHR_GUN_DEATHS = import.meta.env.VITE_SHOW_CHR_GUN_DEATHS

// Map of phrase segment index to its selected value
export type PhraseSelections = Record<number, string>

// Map of phrase selection ID to the display value
type PhraseSelector = Record<string, string>

// Each phrase segment of the mad lib is either a string of text
// or a map of IDs to string options that can fill in a blank
export type PhraseSegment = string | PhraseSelector

export type MadLibId = 'disparity' | 'comparegeos' | 'comparevars'

export const MADLIB_MODE_MAP: Record<string, MadLibId> = {
  Off: 'disparity',
  Places: 'comparegeos',
  Topics: 'comparevars',
}

const CategoryMap = {
  'behavioral-health': 'Behavioral Health',
  'black-women-health': `Black Women's Health`,
  'chronic-disease': 'Chronic Disease',
  covid: 'COVID-19',
  hiv: 'HIV',
  medicare: 'Medication Utilization',
  pdoh: 'Political Determinants of Health',
  sdoh: 'Social Determinants of Health',
  'community-safety': 'Community Safety',
  maternal_health: 'Maternal Health',
  cancer: 'Cancer',
}

export type CategoryTypeId = keyof typeof CategoryMap

type CategoryTitle = (typeof CategoryMap)[CategoryTypeId]

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
  newValue: DropdownVarId | string, // condition or numeric-string FIPS code
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

export function getPhraseValue(
  madLib: MadLib,
  segmentIndex: number,
): string | DropdownVarId {
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
    METRIC_CONFIG[getPhraseValue(madLib, 1) as any as DropdownVarId]
  // get 2nd condition if in compare var mode
  const condition2array: DataTypeConfig[] =
    madLib.id === 'comparevars'
      ? METRIC_CONFIG[getPhraseValue(madLib, 3) as any as DropdownVarId]
      : []

  // make a list of conditions and sub-conditions, including #2 if it's unique
  return condition2array?.length && condition2array !== condition1array
    ? [...condition1array, ...condition2array]
    : condition1array
}

export type DefaultDropdownVarId = 'default'
export const DEFAULT: DefaultDropdownVarId = 'default'

export const DROPDOWN_TOPIC_MAP: Record<
  DropdownVarId | DefaultDropdownVarId,
  string
> = {
  default: 'select a topic',
  asthma: 'Asthma',
  avoided_care: 'Care Avoidance Due to Cost',
  cancer_screening: 'Cancer Screening',
  cancer_incidence: 'Cancer',
  cardiovascular_diseases: 'Cardiovascular Diseases',
  chronic_kidney_disease: 'Chronic Kidney Disease',
  copd: 'COPD',
  covid_vaccinations: 'COVID-19 Vaccinations',
  covid: 'COVID-19',
  depression: 'Depression',
  diabetes: 'Diabetes',
  excessive_drinking: 'Excessive Drinking',
  frequent_mental_distress: 'Frequent Mental Distress',
  gun_deaths: 'Gun Deaths',
  gun_violence: 'Gun Homicides and Suicides',
  gun_violence_youth: 'Gun Deaths (Youth)',
  gun_deaths_black_men: 'Gun Homicides (Black Men)',
  health_insurance: 'Uninsured Individuals',
  hiv_black_women: 'HIV (Black Women)',
  hiv_care: 'Linkage to HIV Care',
  hiv_prep: 'PrEP Coverage',
  hiv_stigma: 'HIV Stigma',
  hiv: 'HIV',
  incarceration: 'Incarceration',
  poverty: 'Poverty',
  maternal_mortality: 'Maternal Mortality',
  medicare_cardiovascular: 'Cardiovascular Conditions and Medication Adherence',
  medicare_hiv: 'HIV Conditions and Medication Adherence',
  medicare_mental_health: 'Mental Health Conditions and Medication Adherence',
  preventable_hospitalizations: 'Preventable Hospitalization',
  substance: 'Opioid and Other Substance Misuse',
  suicide: 'Suicide',
  voter_participation: 'Voter Participation',
  women_in_gov: 'Women Serving in Legislative Office',
}

export const SELECTED_DROPDOWN_OVERRIDES: Partial<
  Record<DropdownVarId, string>
> = {
  medicare_cardiovascular: 'Medicare Beneficiary',
  medicare_hiv: 'Medicare Beneficiary',
  medicare_mental_health: 'Medicare Beneficiary',
  hiv_black_women: 'HIV',
  incarceration: 'Incarceration in',
  women_in_gov: 'Women Serving in',
  gun_violence: 'Gun',
  gun_violence_youth: 'All Gun Deaths of',
  cancer_screening: 'Screening adherence for',
  gun_deaths_black_men: 'Black Male Gun Homicide Victims',
  cancer_incidence: 'Incidence for',
}

export interface Category {
  title: CategoryTitle
  options: DropdownVarId[]
  definition?: string
}

const CATEGORIES_LIST: Category[] = [
  {
    title: 'HIV',
    definition: '',
    options: HIV_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[],
  },
  {
    title: 'Chronic Disease',
    definition: '',
    options: CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[],
  },
  {
    title: 'Behavioral Health',
    definition: '',
    options:
      BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[],
  },
  {
    title: 'Political Determinants of Health',
    definition: '',
    options: PDOH_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[],
  },
  {
    title: 'Social Determinants of Health',
    definition: '',
    options: SDOH_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[],
  },
  {
    title: 'COVID-19',
    definition: '',
    options: COVID_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[],
  },
  {
    title: 'Community Safety',
    definition: '',
    options: SHOW_CHR_GUN_DEATHS
      ? (COMMUNITY_SAFETY_DROPDOWNIDS as unknown as DropdownVarId[])
      : (COMMUNITY_SAFETY_DROPDOWNIDS_NO_CHR as unknown as DropdownVarId[]),
  },
  {
    title: 'Medication Utilization in the Medicare Population',
    definition: '',
    // TODO: clean this up once PHRMA fully launched all topics
    options: SHOW_PHRMA_MENTAL_HEALTH
      ? (MEDICARE_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[])
      : (MEDICARE_CATEGORY_HIV_AND_CVD_DROPDOWNIDS as unknown as DropdownVarId[]),
  },
]

if (SHOW_NEW_MATERNAL_MORTALITY) {
  CATEGORIES_LIST.push({
    title: 'Maternal Health',
    definition: '',
    options: MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS as unknown as DropdownVarId[],
  })
}

if (SHOW_CANCER_SCREENINGS) {
  CATEGORIES_LIST.push({
    title: 'Cancer',
    definition: '',
    options: [
      ...CDC_CANCER_CATEGORY_DROPDOWNIDS,
      ...CANCER_SCREENING_CATEGORY_DROPDOWNIDS,
    ] as unknown as DropdownVarId[],
  })
}

const MADLIB_LIST: MadLib[] = [
  {
    id: 'disparity',
    phrase: ['Investigate rates of', DROPDOWN_TOPIC_MAP, 'in', FIPS_MAP],
    defaultSelections: { 1: DEFAULT, 3: USA_FIPS },
    activeSelections: { 1: DEFAULT, 3: USA_FIPS },
  },
  {
    id: 'comparegeos',
    phrase: [
      'Compare rates of',
      DROPDOWN_TOPIC_MAP,
      'between',
      FIPS_MAP,
      'and',
      FIPS_MAP,
    ],
    defaultSelections: { 1: 'poverty', 3: GEORGIA_FIPS, 5: USA_FIPS },
    activeSelections: { 1: 'poverty', 3: GEORGIA_FIPS, 5: USA_FIPS },
  },
  {
    id: 'comparevars',
    phrase: [
      'Explore relationships between',
      DROPDOWN_TOPIC_MAP,
      'and',
      DROPDOWN_TOPIC_MAP,
      'in',
      FIPS_MAP,
    ],
    defaultSelections: { 1: 'poverty', 3: 'uninsurance', 5: USA_FIPS },
    activeSelections: { 1: 'poverty', 3: 'uninsurance', 5: USA_FIPS },
  },
]

function insertOptionalThe(phraseSelections: PhraseSelections, index: number) {
  return phraseSelections[index + 1] === USA_FIPS ? ' the' : ''
}

function getConfigFromDataTypeId(id: DataTypeId | string): DataTypeConfig {
  const config = Object.values(METRIC_CONFIG)
    .flat()
    .find((config) => config.dataTypeId === id)
  // fallback to covid cases
  return config ?? METRIC_CONFIG.covid[0]
}

function getParentDropdownFromDataTypeId(dataType: DataTypeId): DropdownVarId {
  for (const [dropdownId, configArray] of Object.entries(METRIC_CONFIG)) {
    if (configArray.map((config) => config.dataTypeId).includes(dataType)) {
      return dropdownId as any as DropdownVarId
    }
  }
  // fallback
  return 'poverty'
}

function getFipsListFromMadlib(madlib: MadLib) {
  const madLibMode = madlib.id

  switch (madLibMode) {
    case 'disparity':
      return [new Fips(getPhraseValue(madlib, 3))]
    case 'comparegeos':
      return [
        new Fips(getPhraseValue(madlib, 3)),
        new Fips(getPhraseValue(madlib, 5)),
      ]
    case 'comparevars':
      return [new Fips(getPhraseValue(madlib, 5))]
  }
}

export {
  CATEGORIES_LIST,
  getConfigFromDataTypeId,
  getFipsListFromMadlib,
  getMadLibPhraseText,
  getParentDropdownFromDataTypeId,
  insertOptionalThe,
  MADLIB_LIST,
}
