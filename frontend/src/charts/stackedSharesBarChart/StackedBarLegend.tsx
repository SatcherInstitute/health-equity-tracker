import { STACKED_BAR_COLORS, STACKED_BAR_MARGIN } from './Index'

interface StackedBarLegendProps {
  metricDisplayName: string
}
export default function StackedBarLegend(props: StackedBarLegendProps) {
  
  return (
    <g
      aria-label='legend'
      transform={`translate(0,${STACKED_BAR_MARGIN.top * -1})`}
    >
      <g aria-label='light green bars represent % of population'>
        <circle r={6} cy={6} cx={6} fill={STACKED_BAR_COLORS.population} />
        <text
          x={18}
          y={10}
          className='text-smallest'
          tabIndex={-1}
          aria-hidden='true'
        >
          % of population
        </text>
      </g>
      <g
        transform='translate(0,15)'
        aria-label={`dark green bars represent ${props.metricDisplayName}`}
      >
        <circle r={6} cy={6} cx={6} fill={STACKED_BAR_COLORS.distribution} />
        <text
          x={18}
          y={10}
          className='text-smallest'
          tabIndex={-1}
          aria-hidden='true'
        >
          {props.metricDisplayName}
        </text>
      </g>
    </g>
  )
}
