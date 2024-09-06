import type { MetricConfig, MetricType } from '../data/config/MetricConfig'
import HetUnitLabel from '../styles/HetComponents/HetUnitLabel'

const metricTypeLabelMap: Record<MetricType, string> = {
  per100k: 'per 100k',
  pct_share: '% share',
  count: 'people',
  index: '',
  age_adjusted_ratio: '×',
  pct_relative_inequity: '%',
  pct_rate: '%',
}

interface UnitsProps {
  column: number
  metric: MetricConfig[]
}
export default function Units(props: UnitsProps) {
  if (!props.column) return null

  const metric = props.metric[props.column - 1]

  const unit =
    metric.type === 'per100k'
      ? metricTypeLabelMap[metric.type]
      : metric.shortLabel

  // If it's 100k and tiny screen, the unit should be a block and appear on the next line
  return (
    <HetUnitLabel
      className={metric.type === 'per100k' ? 'block sm:inline' : 'inline'}
    >
      {metric.type === 'per100k' ? ' ' : ''}
      {unit}
    </HetUnitLabel>
  )
}
