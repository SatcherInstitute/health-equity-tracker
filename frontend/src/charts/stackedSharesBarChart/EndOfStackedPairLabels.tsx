import type { ScaleLinear } from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'

interface EndOfStackedPairLabelsProps {
  darkValue: number
  darkMetric: MetricConfig
  xScale: ScaleLinear<number, number>
  yPosition: number
  barHeight: number
  pairGap: number
}

export default function EndOfStackedPairLabels(
  props: EndOfStackedPairLabelsProps,
) {
  const { darkValue, xScale, yPosition, barHeight, pairGap } = props

  // Helper function to determine if a label should be inside based on available space
  const shouldLabelBeInside = (value: number): boolean => {
    // Get the scaled width of the bar in pixels
    const barWidth = xScale(value) - xScale(0)

    // Estimate text width (assuming ~8px per character plus metric label)
    const textWidth =
      (value?.toFixed(1).length + props.darkMetric.shortLabel.length + 1) * 8

    // Label should be inside if there's enough space in the bar
    return barWidth > textWidth + 20 // Add 20px padding for comfort
  }

  const darkLabelInside = shouldLabelBeInside(darkValue)

  const darkBarLabel =
    darkValue !== null ? `${darkValue}${props.darkMetric.shortLabel}` : ''

  return (
    <text
      aria-hidden='true'
      tabIndex={-1}
      x={
        darkLabelInside
          ? xScale(darkValue ?? 0) - 8 // Inside padding
          : xScale(darkValue ?? 0) + 8 // Outside padding
      }
      y={yPosition + barHeight * 1.5 + pairGap}
      dominantBaseline='middle'
      textAnchor={darkLabelInside ? 'end' : 'start'}
      fill={darkLabelInside ? 'white' : 'black'}
      className='text-smallest'
    >
      {darkBarLabel}
    </text>
  )
}
