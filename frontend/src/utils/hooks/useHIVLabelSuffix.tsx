import { useMemo } from 'react'
import {
  AGE,
  ALL,
  RACE,
  type DemographicGroup,
} from '../../data/utils/Constants'
import { type DataTypeId } from '../../data/config/MetricConfig'
import { DATATYPES_NEEDING_13PLUS } from '../../data/providers/HivProvider'
import { type DemographicType } from '../../data/query/Breakdowns'
import { DEMOGRAPHIC_PARAM } from '../urlutils'
import { useParamState } from './useParamState'

const prepSuffix = ' (16+)'
const hivSuffix = ' (13+)'
const stigmaSuffix = ' (18+)'

export function useHIVLabelSuffix(
  value: DemographicGroup,
  dataTypeId: DataTypeId
): string {
  const [demographicType] = useParamState<DemographicType>(
    /* paramKey */ DEMOGRAPHIC_PARAM,
    /* paramDefaultValue */ RACE
  )
  const suffix = useMemo(() => {
    if (demographicType === AGE && value === ALL) {
      if (dataTypeId === 'hiv_prep') {
        return prepSuffix
      } else if (dataTypeId === 'hiv_stigma') {
        return stigmaSuffix
      } else if (DATATYPES_NEEDING_13PLUS.includes(dataTypeId)) {
        return hivSuffix
      }
    }
    return ''
  }, [demographicType, value, dataTypeId])

  return suffix
}
