import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import { HetChartHoverTooltip } from '../HetChartHoverTooltip'
import { getDemographicGroupLabel } from '../utils'

export interface TooltipData {
  lightValue: number | null
  darkValue: number | null
  demographic: string
  x: number
  y: number
}

interface TooltipProps {
  lightMetric: MetricConfig
  darkMetric: MetricConfig
  data: TooltipData | null
  demographicType: DemographicType
}

export function StackedSharesBarChartTooltip({
  data,
  lightMetric,
  darkMetric,
  demographicType,
}: TooltipProps) {
  if (!data) return null

  const groupLabel =
    getDemographicGroupLabel(demographicType, data.demographic) ||
    data.demographic

  return (
    <HetChartHoverTooltip x={data.x} y={data.y}>
      <div className='font-semibold'>{groupLabel}</div>
      <div className='font-normal'>
        {data.lightValue?.toFixed(1)}
        {lightMetric.shortLabel}
      </div>
      <div className='font-normal'>
        {data.darkValue?.toFixed(1)}
        {darkMetric.shortLabel}
      </div>
    </HetChartHoverTooltip>
  )
}
