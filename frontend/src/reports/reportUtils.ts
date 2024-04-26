import {
  type DataTypeId,
  type DataTypeConfig,
} from '../data/config/MetricConfig'
import {
  AHR_DATATYPES_WITH_MISSING_AGE_DEMO,
  AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/AhrProvider'
import {
  CAWP_DATA_TYPES,
  CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/CawpProvider'
import { BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS } from '../data/providers/GunDeathsBlackMenProvider'
import { GUN_VIOLENCE_YOUTH_RESTRICTED_DEMOGRAPHIC_DETAILS } from '../data/providers/GunViolenceYouthProvider'
import {
  BLACK_WOMEN_DATATYPES,
  BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/HivProvider'
import {
  PHRMA_DATATYPES,
  PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS,
} from '../data/providers/PhrmaProvider'
import { COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS } from '../data/providers/VaccineProvider'
import { type DemographicType } from '../data/query/Breakdowns'
import { type Fips } from '../data/utils/Fips'

const DEMOGRAPHIC_TYPES_MAP: Partial<Record<string, DemographicType>> = {
  'Race/ethnicity': 'race_and_ethnicity',
  Sex: 'sex',
  Age: 'age',
}

const ONLY_AGE_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  Age: 'age',
}

const ONLY_RACE_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  'Race/ethnicity': 'race_and_ethnicity',
}

const ONLY_SEX_RACE_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  'Race/ethnicity': 'race_and_ethnicity',
  Sex: 'sex',
}

const PHRMA_TYPES_MAP: Partial<Record<string, DemographicType>> = {
  'Race/ethnicity': 'race_and_ethnicity',
  Sex: 'sex',
  Age: 'age',
  Subsidy: 'lis',
  Eligibility: 'eligibility',
}

const BLACK_MEN_TYPE_MAP: Partial<Record<string, DemographicType>> = {
  Urbanicity: 'urbanicity',
  Age: 'age',
}

export function isStateCountyLevel(fips1?: Fips, fips2?: Fips) {
  return (
    Boolean(fips1?.isStateOrTerritory()) ||
    Boolean(fips2?.isStateOrTerritory()) ||
    Boolean(fips1?.isCounty()) ||
    Boolean(fips2?.isCounty())
  )
}

/*
Takes an array of DataTypeConfigs (each having an id), and an array of possible match ids, and returns true if any of the configs contain one of the ids
*/
export function configsContainsMatchingId(
  configs: DataTypeConfig[],
  ids: DataTypeId[],
  bothNeedToMatch?: boolean
) {
  return bothNeedToMatch
    ? configs.every((config) => ids.includes(config.dataTypeId))
    : configs.some((config) => ids.includes(config.dataTypeId))
}

export function getAllDemographicOptions(
  dataTypeConfig1: DataTypeConfig | null,
  fips1: Fips,
  dataTypeConfig2?: DataTypeConfig | null,
  fips2?: Fips
) {
  const configs: DataTypeConfig[] = []
  dataTypeConfig1 && configs.push(dataTypeConfig1)
  dataTypeConfig2 && configs.push(dataTypeConfig2)

  // DEFAULT ENABLED AND DISABLED DEMOGRAPHIC OPTIONS
  let enabledDemographicOptionsMap = DEMOGRAPHIC_TYPES_MAP
  const disabledDemographicOptionsWithRepeats: string[][] = []

  // GUN VIOLENCE YOUTH
  if (configsContainsMatchingId(configs, ['gun_violence_youth'])) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...GUN_VIOLENCE_YOUTH_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  }


  // BLACK WOMEN HIV
  if (configsContainsMatchingId(configs, BLACK_WOMEN_DATATYPES)) {
    enabledDemographicOptionsMap = ONLY_AGE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  }

  // SELECT AHR CONDITIONS
  if (configsContainsMatchingId(configs, AHR_DATATYPES_WITH_MISSING_AGE_DEMO)) {
    enabledDemographicOptionsMap = ONLY_SEX_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  }

  // CAWP
  if (configsContainsMatchingId(configs, CAWP_DATA_TYPES)) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS
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
      ...PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS
    )

  // COVID VACCINATIONS
  if (
    configsContainsMatchingId(configs, ['covid_vaccinations']) &&
    isStateCountyLevel(fips1, fips2)
  ) {
    enabledDemographicOptionsMap = ONLY_RACE_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  }

  // GUN HOMICIDES BLACK MEN BY URBANICITY
  if (
    configsContainsMatchingId(configs, ['gun_deaths_black_men'])) {
    enabledDemographicOptionsMap = BLACK_MEN_TYPE_MAP
    disabledDemographicOptionsWithRepeats.push(
      ...BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  }
  // remove any duplicates
  const disabledDemographicOptions = Array.from(
    new Set(disabledDemographicOptionsWithRepeats)
  )

  return {
    enabledDemographicOptionsMap,
    disabledDemographicOptions,
  }
}
