import type { ScaleBand } from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { formatValue } from '../sharedBarChartPieces/helpers'

interface EndOfRateBarLabelProps {
  metricConfig: MetricConfig
  d: Record<string, any>
  shouldLabelBeInside: boolean
  barWidth: number
  yScale: ScaleBand<string>
  barLabelColor: string
  isTinyAndUp: boolean
}

export default function EndOfRateBarLabel(props: EndOfRateBarLabelProps) {
  return (
    <text
      x={props.shouldLabelBeInside ? props.barWidth - 5 : props.barWidth + 5}
      y={props.yScale.bandwidth() / 2}
      dy='1.3em'
      textAnchor={props.shouldLabelBeInside ? 'end' : 'start'}
      className={`text-smallest ${props.barLabelColor}`}
      aria-hidden='true'
      tabIndex={-1}
    >
      {formatValue(
        props.d[props.metricConfig.metricId],
        props.metricConfig,
        props.isTinyAndUp,
      )}
    </text>
  )
}
