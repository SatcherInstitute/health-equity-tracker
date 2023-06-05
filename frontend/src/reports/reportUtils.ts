import { type DataTypeConfig } from '../data/config/MetricConfig'
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
import { type BreakdownVar } from '../data/query/Breakdowns'

export const DEMOGRAPHIC_BREAKDOWNS_MAP: Partial<Record<string, BreakdownVar>> =
  {
    'Race/ethnicity': 'race_and_ethnicity',
    Sex: 'sex',
    Age: 'age',
  }

export const BLACK_WOMEN_BREAKDOWNS_MAP: Partial<Record<string, BreakdownVar>> =
  {
    Age: 'age',
  }

export const CAWP_BREAKDOWNS_MAP: Partial<Record<string, BreakdownVar>> = {
  'Race/ethnicity': 'race_and_ethnicity',
}

export const PHRMA_BREAKDOWNS_MAP: Partial<Record<string, BreakdownVar>> = {
  'Race/ethnicity': 'race_and_ethnicity',
  Sex: 'sex',
  Age: 'age',
  Subsidy: 'LIS',
  Eligibility: 'eligibility',
}

function getIsBlackWomen(dataTypeConfig: DataTypeConfig | null) {
  return (
    dataTypeConfig?.dataTypeId &&
    BLACK_WOMEN_DATATYPES.includes(dataTypeConfig.dataTypeId)
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
    return BLACK_WOMEN_BREAKDOWNS_MAP
  }

  if (
    getIsCAWP(dataTypeConfig1) ??
    (dataTypeConfig2 && getIsCAWP(dataTypeConfig2))
  ) {
    return CAWP_BREAKDOWNS_MAP
  }

  // compare mode needs BOTH to be PHRMA
  if (dataTypeConfig1 && dataTypeConfig2) {
    if (getIsPhrma(dataTypeConfig1) && getIsPhrma(dataTypeConfig2))
      return PHRMA_BREAKDOWNS_MAP
  }

  if (getIsPhrma(dataTypeConfig1) && dataTypeConfig2 === undefined) {
    return PHRMA_BREAKDOWNS_MAP
  }

  return DEMOGRAPHIC_BREAKDOWNS_MAP
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

  return Array.from(new Set(disabledDemographicOptions))
}
