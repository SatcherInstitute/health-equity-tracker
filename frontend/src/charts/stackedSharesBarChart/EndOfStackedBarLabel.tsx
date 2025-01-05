import type { ScaleLinear } from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'

interface EndOfStackedPairLabelsProps {
  lightValue: number
  darkValue: number
  darkMetric: MetricConfig
  lightMetric: MetricConfig
  xScale: ScaleLinear<number, number>
  yPosition: number
  barHeight: number
  pairGap: number
}

export default function EndOfStackedPairLabels(
  props: EndOfStackedPairLabelsProps,
) {
  const { lightValue, darkValue, xScale, yPosition, barHeight, pairGap } = props

  // Helper function to determine if a label should be inside based on available space
  const shouldLabelBeInside = (value: number): boolean => {
    // Get the scaled width of the bar in pixels
    const barWidth = xScale(value) - xScale(0)

    // Estimate text width (assuming ~8px per character plus metric label)
    const textWidth =
      (value.toFixed(1).length + props.lightMetric.shortLabel.length + 1) * 8

    // Label should be inside if there's enough space in the bar
    return barWidth > textWidth + 20 // Add 20px padding for comfort
  }

  // Calculate positioning for each label
  const lightLabelInside = shouldLabelBeInside(lightValue)
  const darkLabelInside = shouldLabelBeInside(darkValue)

  return (
    <>
      <text
        x={
          lightLabelInside
            ? xScale(lightValue) - 8 // Inside padding
            : xScale(lightValue) + 8 // Outside padding
        }
        y={yPosition + barHeight / 2}
        dominantBaseline='middle'
        textAnchor={lightLabelInside ? 'end' : 'start'}
        fill={lightLabelInside ? 'white' : 'black'}
        className='text-smallest'
      >
        {`${lightValue?.toFixed(1)} ${props.lightMetric.shortLabel}`}
      </text>
      <text
        x={
          darkLabelInside
            ? xScale(darkValue) - 8 // Inside padding
            : xScale(darkValue) + 8 // Outside padding
        }
        y={yPosition + barHeight * 1.5 + pairGap}
        dominantBaseline='middle'
        textAnchor={darkLabelInside ? 'end' : 'start'}
        fill={darkLabelInside ? 'white' : 'black'}
        className='text-smallest'
      >
        {`${darkValue?.toFixed(1)} ${props.darkMetric.shortLabel}`}
      </text>
    </>
  )
}
