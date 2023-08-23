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

/*
Takes an array of DataTypeConfigs (each having an id), and an array of possible match ids, and returns true if any of the configs contain one of the ids
*/
function configsContainsMatchingId(
  configs: DataTypeConfig[],
  ids: DataTypeId[],
  bothNeedToMatch?: boolean
) {
  return bothNeedToMatch
    ? configs.every((config) => ids.includes(config.dataTypeId))
    : configs.some((config) => ids.includes(config.dataTypeId))
}

/* Some datatypes have different demographic options */
export function getDemographicOptionsMap(
  dataTypeConfig1: DataTypeConfig | null,
  fips1: Fips,
  dataTypeConfig2?: DataTypeConfig | null,
  fips2?: Fips
) {
  const configs: DataTypeConfig[] = []
  dataTypeConfig1 && configs.push(dataTypeConfig1)
  dataTypeConfig2 && configs.push(dataTypeConfig2)

  if (configsContainsMatchingId(configs, BLACK_WOMEN_DATATYPES))
    return ONLY_AGE_TYPE_MAP
  if (configsContainsMatchingId(configs, AHR_DATATYPES_WITH_MISSING_AGE_DEMO))
    return ONLY_SEX_RACE_TYPE_MAP
  if (configsContainsMatchingId(configs, CAWP_DATA_TYPES))
    return ONLY_RACE_TYPE_MAP
  if (configsContainsMatchingId(configs, PHRMA_DATATYPES, true))
    return PHRMA_TYPES_MAP
  const isStateCountyLevel =
    fips1?.isStateOrTerritory() ??
    fips2?.isStateOrTerritory() ??
    fips1?.isCounty() ??
    fips2?.isCounty()
  if (
    configsContainsMatchingId(configs, ['covid_vaccinations']) &&
    isStateCountyLevel
  )
    return ONLY_RACE_TYPE_MAP

  return DEMOGRAPHIC_TYPES_MAP
}

export function getDisabledDemographicOptions(
  dataTypeConfig1: DataTypeConfig | null,
  dataTypeConfig2?: DataTypeConfig | null,
  fips1?: Fips,
  fips2?: Fips
) {
  const configs: DataTypeConfig[] = []
  dataTypeConfig1 && configs.push(dataTypeConfig1)
  dataTypeConfig2 && configs.push(dataTypeConfig2)

  const disabledDemographicOptions: string[][] = []

  configsContainsMatchingId(configs, BLACK_WOMEN_DATATYPES) &&
    disabledDemographicOptions.push(
      ...BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  configsContainsMatchingId(configs, CAWP_DATA_TYPES) &&
    disabledDemographicOptions.push(...CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS)
  configsContainsMatchingId(configs, AHR_DATATYPES_WITH_MISSING_AGE_DEMO) &&
    disabledDemographicOptions.push(
      ...AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  const isStateCountyLevel =
    fips1?.isStateOrTerritory() ??
    fips2?.isStateOrTerritory() ??
    fips1?.isCounty() ??
    fips2?.isCounty()
  isStateCountyLevel &&
    configsContainsMatchingId(configs, ['covid_vaccinations']) &&
    disabledDemographicOptions.push(
      ...COVID_VACCINATION_RESTRICTED_DEMOGRAPHIC_DETAILS
    )

  const exactlyOneReportIsPhrma =
    dataTypeConfig1?.dataTypeId &&
    dataTypeConfig2?.dataTypeId &&
    Boolean(PHRMA_DATATYPES.includes(dataTypeConfig1.dataTypeId)) !==
      Boolean(PHRMA_DATATYPES.includes(dataTypeConfig2.dataTypeId))
  exactlyOneReportIsPhrma &&
    disabledDemographicOptions.push(...PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS)

  return Array.from(new Set(disabledDemographicOptions))
}
