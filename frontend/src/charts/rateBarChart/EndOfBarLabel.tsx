import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { formatValue } from './helpers'

interface EndOfBarLabelProps {
  metricConfig: MetricConfig
  d: Record<string, any>
  shouldLabelBeInside: boolean
  barWidth: number
  yScale: any
  barLabelColor: string
}

export default function EndOfBarLabel(props: EndOfBarLabelProps) {
  return (
    <text
      x={props.shouldLabelBeInside ? props.barWidth - 5 : props.barWidth + 5}
      y={props.yScale.bandwidth() / 2}
      dy='1.3em'
      textAnchor={props.shouldLabelBeInside ? 'end' : 'start'}
      className={`text-smallest ${props.barLabelColor}`}
    >
      {formatValue(props.d[props.metricConfig.metricId], props.metricConfig)}
    </text>
  )
}
