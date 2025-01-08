import { type ScaleLinear, format } from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

interface XAxisProps {
  metricConfig: MetricConfig
  secondaryMetricConfig?: MetricConfig
  xScale: ScaleLinear<number, number>
  width: number
  height: number
}

export default function XAxis(props: XAxisProps) {
  const isTinyAndUp = useIsBreakpointAndUp('tiny')
  const numOfLabeledTicks = isTinyAndUp ? 5 : 3

  const formatTick =
    props.metricConfig.type === 'per100k'
      ? format('.2~s') // Uses SI-prefix with 2 significant digits
      : format(',') // Uses thousands separator

  const xAxisLabel = props.secondaryMetricConfig
    ? props.secondaryMetricConfig.shortLabel +
      ' vs ' +
      props.metricConfig.shortLabel
    : props.metricConfig.shortLabel

  return (
    <>
      {/* X Axis Metric Label */}
      <text
        transform={`translate(${props.width / 2},${props.height + 40})`}
        textAnchor='middle'
        className='font-semibold text-smallest'
        aria-label='X Axis Label'
      >
        {xAxisLabel}
      </text>
      {/* X Axis */}
      <g
        aria-hidden='true'
        tabIndex={-1}
        transform={`translate(0,${props.height})`}
      >
        <line x1={0} x2={props.width} y1={0} y2={0} stroke='currentColor' />

        {/* X Axis Numbered Ticks */}
        {props.xScale.ticks(numOfLabeledTicks).map((tick, index) => (
          <g key={index} transform={`translate(${props.xScale(tick)},0)`}>
            <line y2={6} stroke='currentColor' />
            <text
              y={9}
              dy='.71em'
              textAnchor='middle'
              className='fill-current text-smallest'
            >
              {formatTick(tick)}
            </text>
          </g>
        ))}
      </g>
    </>
  )
}
