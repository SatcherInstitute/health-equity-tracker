import { useMemo } from 'react'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import { AGE, ALL, type DemographicGroup } from '../../data/utils/Constants'
import { type VariableId } from '../../data/config/MetricConfig'

const prepSuffix = ' (16+)'
const hivSuffix = ' (13+)'
const VARIABLES_NEEDING_13PLUS: VariableId[] = [
  'hiv_deaths',
  'hiv_diagnoses',
  'hiv_care',
  'hiv_prevalence',
]

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
