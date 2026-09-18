import {
  AHR_DATATYPES_WITH_MISSING_AGE_DEMO,
  CHR_DATATYPE_IDS,
} from '../data/config/MetricConfigBehavioralHealth'
import {
  CDC_CANCER_ALL_SEXES_DATATYPES,
  CDC_CANCER_SEX_SPECIFIC_DATATYPES,
} from '../data/config/MetricConfigCancer'
import { GUN_VIOLENCE_YOUTH_DATATYPES } from '../data/config/MetricConfigCommunitySafety'
import { BLACK_WOMEN_DATATYPES } from '../data/config/MetricConfigHivCategory'
import { CAWP_DATA_TYPES } from '../data/config/MetricConfigPDOH'
import { PHRMA_DATATYPES } from '../data/config/MetricConfigPhrma'
import {
  PHRMA_BRFSS_ALL_SEXES_DATATYPES,
  PHRMA_BRFSS_SEX_SPECIFIC_DATATYPES,
} from '../data/config/MetricConfigPhrmaBrfss'
import type {
  DataTypeConfig,
  DataTypeId,
} from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'

const AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Substance Misuse and Preventable Hospitalizations'],
]
const SEVERE_MATERNAL_MORBIDITY_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Sex', 'unavailable for Severe Maternal Morbidity'],
]
const CHR_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable at the county level'],
  ['Sex', 'unavailable at the county level'],
]
const MATERNAL_MORTALITY_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Maternal Mortality'],
  ['Sex', 'unavailable for Maternal Mortality'],
]
const BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Race/Ethnicity', 'unavailable for intersectional Black men topics'],
  ['Sex', 'unavailable for intersectional Black men topics'],
]
const BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS_URBANICITY = [
  ['City Size', 'unavailable for when comparing these topics'],
]
const GUN_VIOLENCE_YOUTH_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Gun Deaths (Youth)'],
  ['Sex', 'unavailable for Gun Deaths (Youth)'],
]
const BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Race/Ethnicity', 'unavailable for intersectional Black women topics'],
  ['Sex', 'unavailable for intersectional Black women topics'],
]
const CDC_CANCER_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS = [
  [
    'Sex',
    "only available when comparing cancer incidence topics that aren't sex-specific",
  ],
]
const PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Low Income Subsidy', 'only available when comparing two Medicare topics'],
  ['Eligibility', 'only available when comparing two Medicare topics'],
]
const PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Income', 'only available when comparing two cancer screening topics'],
  [
    'Insurance Status',
    'only available when comparing two cancer screening topics',
  ],
  ['Education', 'only available when comparing two cancer screening topics'],
]
const PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS = [
  ...PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_DETAILS,
  [
    'Sex',
    "only available when comparing cancer screening topics that aren't sex-specific",
  ],
]
const COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  [
    'Age',
    'demographics for COVID vaccination unavailable at state and county levels',
  ],
  [
    'Sex',
    'demographics for COVID vaccination unavailable at state and county levels',
  ],
]
const CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Women in elective office topics'],
  ['Sex', 'unavailable for Women in elective office topics'],
]

const DEMOGRAPHIC_TYPES_MAP: Partial<Record<string, DemographicType>> = {
  'Race/Ethnicity': 'race_and_ethnicity',
  'Sex at Birth': 'sex',
  Age: 'age',
}

const ONLY_AGE_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  Age: 'age',
}

const ONLY_RACE_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  'Race/Ethnicity': 'race_and_ethnicity',
}

const ONLY_SEX_RACE_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  'Race/Ethnicity': 'race_and_ethnicity',
  'Sex at Birth': 'sex',
}

const ONLY_RACE_AGE_MAP: Partial<Record<string, DemographicType>> = {
  'Race/Ethnicity': 'race_and_ethnicity',
  Age: 'age',
}

const PHRMA_TYPES_MAP: Partial<Record<string, DemographicType>> = {
  'Race/Ethnicity': 'race_and_ethnicity',
  'Sex at Birth': 'sex',
  Age: 'age',
  'Low Income Subsidy': 'lis',
  Eligibility: 'eligibility',
}

const PHRMA_BRFSS_TYPES_WITHOUT_SEX_MAP: Partial<
  Record<string, DemographicType>
> = {
  'Race/Ethnicity': 'race_and_ethnicity',
  Age: 'age',
  'Insurance Status': 'insurance_status',
  Education: 'education',
  Income: 'income',
}

const PHRMA_BRFSS_TYPES_WITH_SEX_MAP: Partial<Record<string, DemographicType>> =
  {
    'Race/Ethnicity': 'race_and_ethnicity',
    Age: 'age',
    'Insurance Status': 'insurance_status',
    Education: 'education',
    Income: 'income',
    'Sex at Birth': 'sex',
  }

const BLACK_MEN_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  'City Size': 'urbanicity',
  Age: 'age',
}

export function isStateCountyLevel(fips1?: Fips, fips2?: Fips) {
  return isStateLevel(fips1, fips2) || isCountyLevel(fips1, fips2)
}

function isStateLevel(fips1?: Fips, fips2?: Fips) {
  return (
    Boolean(fips1?.isStateOrTerritory()) || Boolean(fips2?.isStateOrTerritory())
  )
}

function isCountyLevel(fips1?: Fips, fips2?: Fips) {
  return Boolean(fips1?.isCounty()) || Boolean(fips2?.isCounty())
}

/*
Takes an array of DataTypeConfigs (each having an id), and an array of possible match ids, and returns true if any of the configs contain one of the ids
*/
export function configsContainsMatchingId(
  configs: DataTypeConfig[],
  ids: DataTypeId[],
  bothNeedToMatch?: boolean,
) {
  return bothNeedToMatch
    ? configs.length > 0 &&
        configs.every((config) => ids.includes(config.dataTypeId))
    : configs.some((config) => ids.includes(config.dataTypeId))
}

export function getAllDemographicOptions(
  dataTypeConfig1: DataTypeConfig | null,
  fips1: Fips,
  dataTypeConfig2?: DataTypeConfig | null,
  fips2?: Fips,
): {
  enabledDemographicOptionsMap: Partial<Record<string, DemographicType>>
  disabledDemographicOptions: string[][]
} {
  // when comparing two different topics, offer the union of each topic's own
  // options; the topic missing a demographic falls back to combined 'All' rates
  if (
    dataTypeConfig1 &&
    dataTypeConfig2 &&
    dataTypeConfig1.dataTypeId !== dataTypeConfig2.dataTypeId
  ) {
    const options1 = getAllDemographicOptions(dataTypeConfig1, fips1)
    const options2 = getAllDemographicOptions(dataTypeConfig2, fips2 ?? fips1)

    const enabledDemographicOptionsMap = {
      ...options1.enabledDemographicOptionsMap,
      ...options2.enabledDemographicOptionsMap,
    }

    const enabledLabels = Object.keys(enabledDemographicOptionsMap)
    const disabledDemographicOptions: string[][] = []
    for (const [option, reason] of [
      ...options1.disabledDemographicOptions,
      ...options2.disabledDemographicOptions,
    ]) {
      if (
        !enabledLabels.includes(option) &&
        !disabledDemographicOptions.some(([opt]) => opt === option)
      ) {
        disabledDemographicOptions.push([option, reason])
      }
    }

    return { enabledDemographicOptionsMap, disabledDemographicOptions }
  }

  const configs: DataTypeConfig[] = []
  dataTypeConfig1 && configs.push(dataTypeConfig1)
  dataTypeConfig2 && configs.push(dataTypeConfig2)

  // DEFAULT ENABLED AND DISABLED DEMOGRAPHIC OPTIONS
  let enabledDemographicOptionsMap = DEMOGRAPHIC_TYPES_MAP
  const disabledDemographicOptionsWithRepeats: string[][] = []

  // GUN VIOLENCE YOUTH
  if (configsContainsMatchingId(configs, GUN_VIOLENCE_YOUTH_DATATYPES)) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...GUN_VIOLENCE_YOUTH_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // MATERNAL MORTALITY

  if (configsContainsMatchingId(configs, ['maternal_mortality'])) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...MATERNAL_MORTALITY_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // SEVERE MATERNAL MORBIDITY (AHR — race and age only, no sex)
  if (configsContainsMatchingId(configs, ['severe_maternal_morbidity'])) {
    enabledDemographicOptionsMap = ONLY_RACE_AGE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...SEVERE_MATERNAL_MORBIDITY_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // BLACK WOMEN HIV
  if (configsContainsMatchingId(configs, BLACK_WOMEN_DATATYPES)) {
    enabledDemographicOptionsMap = ONLY_AGE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // CDC CANCER SEX SPECIFIC CANCERS (ENABLED OPTIONS WHEN ALL REPORTS ARE SEX SPECIFIC CDC CANCER)
  if (
    configsContainsMatchingId(configs, CDC_CANCER_SEX_SPECIFIC_DATATYPES, true)
  )
    enabledDemographicOptionsMap = ONLY_RACE_AGE_MAP

  // CDC CANCER (DISABLED OPTIONS WHEN EXACTLY ONE REPORT IS CDC CANCER)
  const exactlyOneReportIsCdcCancerSexSpecific =
    dataTypeConfig1?.dataTypeId &&
    dataTypeConfig2?.dataTypeId &&
    Boolean(
      CDC_CANCER_SEX_SPECIFIC_DATATYPES.includes(dataTypeConfig1.dataTypeId),
    ) !==
      Boolean(
        CDC_CANCER_SEX_SPECIFIC_DATATYPES.includes(dataTypeConfig2.dataTypeId),
      )
  exactlyOneReportIsCdcCancerSexSpecific &&
    disabledDemographicOptionsWithRepeats.push(
      ...CDC_CANCER_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS,
    )

  // CDC CANCER ALL SEXES (ENABLED OPTIONS WHEN ALL REPORTS ARE ALL SEXES CDC CANCER)
  if (configsContainsMatchingId(configs, CDC_CANCER_ALL_SEXES_DATATYPES, true))
    enabledDemographicOptionsMap = DEMOGRAPHIC_TYPES_MAP

  // SELECT AHR CONDITIONS
  if (
    configsContainsMatchingId(configs, AHR_DATATYPES_WITH_MISSING_AGE_DEMO) &&
    !isCountyLevel(fips1, fips2)
  ) {
    enabledDemographicOptionsMap = ONLY_SEX_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // CHR CONDITIONS WITH ONLY RACE OR ONLY ALLS
  if (
    configsContainsMatchingId(configs, CHR_DATATYPE_IDS) &&
    isCountyLevel(fips1, fips2)
  ) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...CHR_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // CAWP
  if (configsContainsMatchingId(configs, CAWP_DATA_TYPES)) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // PHRMA (ENABLED OPTIONS WHEN ALL REPORTS ARE PHRMA)
  if (configsContainsMatchingId(configs, PHRMA_DATATYPES, true))
    enabledDemographicOptionsMap = PHRMA_TYPES_MAP
  // PHRMA (DISABLED OPTIONS WHEN EXACTLY ONE REPORT IS PHRMA)
  const exactlyOneReportIsPhrma =
    dataTypeConfig1?.dataTypeId &&
    dataTypeConfig2?.dataTypeId &&
    Boolean(PHRMA_DATATYPES.includes(dataTypeConfig1.dataTypeId)) !==
      Boolean(PHRMA_DATATYPES.includes(dataTypeConfig2.dataTypeId))
  exactlyOneReportIsPhrma &&
    disabledDemographicOptionsWithRepeats.push(
      ...PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )

  // PHRMA BRFSS SEX SPECIFIC CANCER SCREENINGS (ENABLED OPTIONS WHEN ALL REPORTS ARE SEX SPECIFIC PHRMA BRFSS)
  if (
    configsContainsMatchingId(configs, PHRMA_BRFSS_SEX_SPECIFIC_DATATYPES, true)
  )
    enabledDemographicOptionsMap = PHRMA_BRFSS_TYPES_WITHOUT_SEX_MAP
  // PHRMA (DISABLED OPTIONS WHEN EXACTLY ONE REPORT IS PHRMA BRFSS)
  const exactlyOneReportIsPhrmaBrfssSexSpecific =
    dataTypeConfig1?.dataTypeId &&
    dataTypeConfig2?.dataTypeId &&
    Boolean(
      PHRMA_BRFSS_SEX_SPECIFIC_DATATYPES.includes(dataTypeConfig1.dataTypeId),
    ) !==
      Boolean(
        PHRMA_BRFSS_SEX_SPECIFIC_DATATYPES.includes(dataTypeConfig2.dataTypeId),
      )
  exactlyOneReportIsPhrmaBrfssSexSpecific &&
    disabledDemographicOptionsWithRepeats.push(
      ...PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS,
    )

  // PHRMA BRFSS ALL SEXES CANCER SCREENINGS (ENABLED OPTIONS WHEN ALL REPORTS ARE ALL SEXES PHRMA BRFSS)
  if (configsContainsMatchingId(configs, PHRMA_BRFSS_ALL_SEXES_DATATYPES, true))
    enabledDemographicOptionsMap = PHRMA_BRFSS_TYPES_WITH_SEX_MAP
  // PHRMA (DISABLED OPTIONS WHEN EXACTLY ONE REPORT IS PHRMA BRFSS)
  const exactlyOneReportIsPhrmaBrfssAllSexes =
    dataTypeConfig1?.dataTypeId &&
    dataTypeConfig2?.dataTypeId &&
    Boolean(
      PHRMA_BRFSS_ALL_SEXES_DATATYPES.includes(dataTypeConfig1.dataTypeId),
    ) !==
      Boolean(
        PHRMA_BRFSS_ALL_SEXES_DATATYPES.includes(dataTypeConfig2.dataTypeId),
      )
  exactlyOneReportIsPhrmaBrfssAllSexes &&
    disabledDemographicOptionsWithRepeats.push(
      ...PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )

  // COVID VACCINATIONS
  if (
    configsContainsMatchingId(configs, ['covid_vaccinations']) &&
    isStateCountyLevel(fips1, fips2)
  ) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }

  // GUN HOMICIDES BLACK MEN BY URBANICITY
  if (configsContainsMatchingId(configs, ['gun_deaths_black_men'])) {
    enabledDemographicOptionsMap = BLACK_MEN_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS,
    )
  }
  // DISABLED OPTIONS WHEN EXACTLY ONE REPORT IS BLACK MEN HOMICIDES
  const exactlyOneReportIsBlackMenHomicides =
    dataTypeConfig1?.dataTypeId &&
    dataTypeConfig2?.dataTypeId &&
    Boolean(['gun_deaths_black_men'].includes(dataTypeConfig1.dataTypeId)) !==
      Boolean(['gun_deaths_black_men'].includes(dataTypeConfig2.dataTypeId))
  if (exactlyOneReportIsBlackMenHomicides) {
    enabledDemographicOptionsMap = ONLY_AGE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS_URBANICITY,
    )
  }

  // remove duplicates from combined array of above additions
  const disabledDemographicOptions: string[][] = []
  for (const [option, reason] of disabledDemographicOptionsWithRepeats) {
    const currentOptions = disabledDemographicOptions.map(([option]) => option)
    if (!currentOptions.includes(option)) {
      disabledDemographicOptions.push([option, reason])
    }
  }

  return {
    enabledDemographicOptionsMap,
    disabledDemographicOptions,
  }
}
