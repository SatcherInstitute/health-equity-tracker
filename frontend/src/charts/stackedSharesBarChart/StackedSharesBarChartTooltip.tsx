import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import { getDemographicGroupLabel } from '../utils'

export interface StackedBarTooltipData {
  lightValue: number | null
  darkValue: number | null
  demographic: string
}

interface TooltipProps {
  lightMetric: MetricConfig
  darkMetric: MetricConfig
  data: StackedBarTooltipData
  demographicType: DemographicType
}

export function StackedSharesBarChartTooltip({
  data,
  lightMetric,
  darkMetric,
  demographicType,
}: TooltipProps) {
  const groupLabel =
    getDemographicGroupLabel(demographicType, data.demographic) ||
    data.demographic

  return (
    <>
      <div className='font-semibold'>{groupLabel}</div>
      <div className='font-normal'>
        {data.lightValue?.toFixed(1)}
        {lightMetric.shortLabel}
      </div>
      <div className='font-normal'>
        {data.darkValue?.toFixed(1)}
        {darkMetric.shortLabel}
      </div>
    </>
  )
}
