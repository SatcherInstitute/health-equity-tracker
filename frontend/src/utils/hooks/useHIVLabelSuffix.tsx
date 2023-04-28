import { useMemo } from 'react'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import { AGE, ALL, type DemographicGroup } from '../../data/utils/Constants'
import { type VariableId } from '../../data/config/MetricConfig'
import { VARIABLES_NEEDING_13PLUS } from '../../data/variables/HivProvider'

const prepSuffix = ' (16+)'
const hivSuffix = ' (13+)'

export function useHIVLabelSuffix(
  demographic: BreakdownVar,
  value: DemographicGroup,
  variableId: VariableId
): string {
  const suffix = useMemo(() => {
    if (demographic === AGE && value === ALL) {
      if (variableId === 'hiv_prep') {
        return prepSuffix
      } else if (VARIABLES_NEEDING_13PLUS.includes(variableId)) {
        return hivSuffix
      }
    }
    return ''
  }, [demographic, value, variableId])

  return suffix
}
