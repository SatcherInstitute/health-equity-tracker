import type {
  DataTypeConfig,
  DataTypeId,
} from '../data/config/MetricConfigTypes'
import {
  AHR_DATATYPES_WITH_MISSING_AGE_DEMO,
  AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS,
  CHR_DATATYPE_IDS,
  CHR_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/AhrProvider'
import {
  CAWP_DATA_TYPES,
  CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/CawpProvider'
import {
  CDC_CANCER_ALL_SEXES_DATATYPES,
  CDC_CANCER_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS,
  CDC_CANCER_SEX_SPECIFIC_DATATYPES,
} from '../data/providers/CdcCancerProvider'
import {
  BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS,
  BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS_URBANICITY,
} from '../data/providers/GunDeathsBlackMenProvider'
import {
  GUN_VIOLENCE_YOUTH_DATATYPES,
  GUN_VIOLENCE_YOUTH_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/GunViolenceYouthProvider'
import {
  BLACK_WOMEN_DATATYPES,
  BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/HivProvider'
import { MATERNAL_MORTALITY_RESTRICTED_DEMOGRAPHIC_DETAILS } from '../data/providers/MaternalMortalityProvider'
import {
  PHRMA_BRFSS_ALL_SEXES_DATATYPES,
  PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_DETAILS,
  PHRMA_BRFSS_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS,
  PHRMA_BRFSS_SEX_SPECIFIC_DATATYPES,
} from '../data/providers/PhrmaBrfssProvider'
import {
  PHRMA_DATATYPES,
  PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/PhrmaProvider'
import { COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS } from '../data/providers/VaccineProvider'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'

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

export function isStateLevel(fips1?: Fips, fips2?: Fips) {
  return (
    Boolean(fips1?.isStateOrTerritory()) || Boolean(fips2?.isStateOrTerritory())
  )
}

export function isCountyLevel(fips1?: Fips, fips2?: Fips) {
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
    ? configs.every((config) => ids.includes(config.dataTypeId))
    : configs.some((config) => ids.includes(config.dataTypeId))
}

export function getAllDemographicOptions(
  dataTypeConfig1: DataTypeConfig | null,
  fips1: Fips,
  dataTypeConfig2?: DataTypeConfig | null,
  fips2?: Fips,
) {
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

  // CHR CONDITIONS WITH ONLY RACE
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

export const CARDS_THAT_SHOULD_FALLBACK_TO_ALLS: ScrollableHashId[] = [
  'rate-map',
  'rates-over-time',
]
