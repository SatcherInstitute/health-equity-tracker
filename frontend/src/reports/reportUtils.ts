import { type DataTypeConfig } from '../data/config/MetricConfig'
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
import { type DemographicType } from '../data/query/Breakdowns'

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

function getIsBlackWomen(dataTypeConfig: DataTypeConfig | null) {
  return (
    dataTypeConfig?.dataTypeId &&
    BLACK_WOMEN_DATATYPES.includes(dataTypeConfig.dataTypeId)
  )
}

function getIsAHRWithMissingDemos(dataTypeConfig: DataTypeConfig | null) {
  return (
    dataTypeConfig?.dataTypeId &&
    AHR_DATATYPES_WITH_MISSING_AGE_DEMO.includes(dataTypeConfig.dataTypeId)
  )
}

function getIsPhrma(dataTypeConfig: DataTypeConfig | null) {
  return (
    dataTypeConfig?.dataTypeId &&
    PHRMA_DATATYPES.includes(dataTypeConfig?.dataTypeId)
  )
}

function getIsCAWP(dataTypeConfig: DataTypeConfig | null) {
  return (
    dataTypeConfig?.dataTypeId &&
    CAWP_DATA_TYPES.includes(dataTypeConfig?.dataTypeId)
  )
}

/* Some datatypes have different demographic options */
export function getDemographicOptionsMap(
  dataTypeConfig1: DataTypeConfig | null,
  dataTypeConfig2?: DataTypeConfig | null
) {
  if (
    getIsBlackWomen(dataTypeConfig1) ??
    (dataTypeConfig2 && getIsBlackWomen(dataTypeConfig2))
  ) {
    return ONLY_AGE_TYPE_MAP
  }

  if (
    getIsAHRWithMissingDemos(dataTypeConfig1) ??
    (dataTypeConfig2 && getIsAHRWithMissingDemos(dataTypeConfig2))
  ) {
    return ONLY_SEX_RACE_TYPE_MAP
  }

  if (
    getIsCAWP(dataTypeConfig1) ??
    (dataTypeConfig2 && getIsCAWP(dataTypeConfig2))
  ) {
    return ONLY_RACE_TYPE_MAP
  }

  // compare mode needs BOTH to be PHRMA
  if (dataTypeConfig1 && dataTypeConfig2) {
    if (getIsPhrma(dataTypeConfig1) && getIsPhrma(dataTypeConfig2))
      return PHRMA_TYPES_MAP
  }

  if (getIsPhrma(dataTypeConfig1) && dataTypeConfig2 === undefined) {
    return PHRMA_TYPES_MAP
  }

  return DEMOGRAPHIC_TYPES_MAP
}

export function getDisabledDemographicOptions(
  dataTypeConfig1: DataTypeConfig | null,
  dataTypeConfig2?: DataTypeConfig | null
) {
  const disabledDemographicOptions: string[][] = []

  const isBlackWomen =
    getIsBlackWomen(dataTypeConfig1) ??
    (dataTypeConfig2 && getIsBlackWomen(dataTypeConfig2))

  const isCAWP =
    getIsCAWP(dataTypeConfig1) ??
    (dataTypeConfig2 && getIsCAWP(dataTypeConfig2))

  const isAHRWithMissingDemos =
    getIsAHRWithMissingDemos(dataTypeConfig1) ??
    (dataTypeConfig2 && getIsAHRWithMissingDemos(dataTypeConfig2))

  const exactlyOneReportIsPhrma =
    dataTypeConfig1?.dataTypeId &&
    dataTypeConfig2?.dataTypeId &&
    Boolean(PHRMA_DATATYPES.includes(dataTypeConfig1.dataTypeId)) !==
      Boolean(PHRMA_DATATYPES.includes(dataTypeConfig2.dataTypeId))

  if (isBlackWomen)
    disabledDemographicOptions.push(
      ...BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS
    )
  if (isCAWP)
    disabledDemographicOptions.push(...CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS)
  if (exactlyOneReportIsPhrma)
    disabledDemographicOptions.push(...PHRMA_RESTRICTED_DEMOGRAPHIC_DETAILS)
  if (isAHRWithMissingDemos)
    disabledDemographicOptions.push(
      ...AHR_PARTIAL_RESTRICTED_DEMOGRAPHIC_DETAILS
    )

  return Array.from(new Set(disabledDemographicOptions))
}
