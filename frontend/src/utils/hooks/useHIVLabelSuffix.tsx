import { useMemo } from 'react'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import { AGE, ALL, type DemographicGroup } from '../../data/utils/Constants'

const prepSuffix = ' (16+)'
const hivSuffix = ' (13+)'

interface useHIVLabelSuffixProps {
  demographic: BreakdownVar
  value: DemographicGroup
  metric: string
}

export function useHIVLabelSuffix(props: useHIVLabelSuffixProps): string {
  const { demographic, value, metric } = props

  const suffix = useMemo(() => {
    if (demographic === AGE && value === ALL) {
      if (metric.includes('prep')) {
        return prepSuffix
      } else if (metric.includes('hiv')) {
        return hivSuffix
      }
    }
    return ''
  }, [demographic, value, metric])

  return suffix
}
