import { HetChartHoverTooltip } from '../HetChartHoverTooltip'

export interface BarChartTooltipData {
  x: number
  y: number
  group: string
  value: string
}

interface BarChartTooltipProps {
  data: BarChartTooltipData | null
}

export default function BarChartTooltip({ data }: BarChartTooltipProps) {
  if (!data) return null
  return (
    <HetChartHoverTooltip x={data.x} y={data.y}>
      <div className='font-semibold'>{data.group}</div>
      <div className='font-normal'>{data.value}</div>
    </HetChartHoverTooltip>
  )
}
