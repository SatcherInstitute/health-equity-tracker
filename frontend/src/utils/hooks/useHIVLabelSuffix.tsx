import { useMemo } from 'react'
import { AGE, ALL, type DemographicGroup } from '../../data/utils/Constants'
import { type DataTypeId } from '../../data/config/MetricConfig'
import { DATATYPES_NEEDING_13PLUS } from '../../data/providers/HivProvider'
import { useAtomValue } from 'jotai'
import { selectedDemographicTypeAtom } from '../sharedSettingsState'

const prepSuffix = ' (16+)'
const hivSuffix = ' (13+)'
const stigmaSuffix = ' (18+)'

export function useHIVLabelSuffix(
  value: DemographicGroup,
  dataTypeId: DataTypeId
): string {
  const demographicType = useAtomValue(selectedDemographicTypeAtom)

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
