import { useMemo } from 'react'
import type { DemographicType } from '../../data/query/Breakdowns'
import { AGE, ALL, type DemographicGroup } from '../../data/utils/Constants'
import type { DataTypeId } from '../../data/config/MetricConfig'
import { DATATYPES_NEEDING_13PLUS } from '../../data/providers/HivProvider'

const prepSuffix = ' (16+)'
const hivSuffix = ' (13+)'
const stigmaSuffix = ' (18+)'
const youthGunViolenceSuffix = '(0-17)'

export function useHIVLabelSuffix(
  demographic: DemographicType,
  value: DemographicGroup,
  dataTypeId: DataTypeId,
): string {
  const suffix = useMemo(() => {
    if (demographic === AGE && value === ALL) {
      if (dataTypeId === 'hiv_prep') {
        return prepSuffix
      } else if (dataTypeId === 'hiv_stigma') {
        return stigmaSuffix
      } else if (DATATYPES_NEEDING_13PLUS.includes(dataTypeId)) {
        return hivSuffix
      }
    }
    return ''
  }, [demographic, value, dataTypeId])

  return suffix
}
