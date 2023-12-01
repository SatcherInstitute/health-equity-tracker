import {
  type MetricConfig,
  SYMBOL_TYPE_LOOKUP,
} from '../data/config/MetricConfig'

interface UnitsProps {
  column: number
  metric: MetricConfig[]
}
export default function Units(props: UnitsProps) {
  if (!props.column) return null

  const metric = props.metric[props.column - 1]

  const unit =
    metric.type === 'per100k'
      ? SYMBOL_TYPE_LOOKUP[metric.type]
      : metric.shortLabel

  // If it's 100k and tiny screen, the unit should be a block and appear on the next line
  return (
    <span
      className={`text-smallest text-alt-dark ${
        metric.type === 'per100k' ? 'block sm:inline' : 'inline'
      }`}
    >
      {metric.type === 'per100k' ? ' ' : ''}
      {unit}
    </span>
  )
}
