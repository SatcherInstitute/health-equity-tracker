import type { ScaleLinear } from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { het } from '../../styles/DesignTokens'

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

  function shouldLabelBeInside(value: number): boolean {
    // Get the scaled width of the bar in pixels
    const barWidth = xScale(value) - xScale(0)

    // Estimate text width (assuming ~8px per character plus metric label)
    const textWidth =
      (value?.toFixed(1).length + props.darkMetric.shortLabel.length + 1) * 8

    // Label should be inside if there's enough space in the bar
    return barWidth > textWidth + 20
  }

  const darkLabelInside = shouldLabelBeInside(darkValue)

  const darkBarLabel =
    darkValue !== null ? `${darkValue}${props.darkMetric.shortLabel}` : ''

  return (
    <text
      tabIndex={-1}
      x={
        darkLabelInside
          ? xScale(darkValue ?? 0) - 8
          : xScale(darkValue ?? 0) + 8
      }
      y={yPosition + barHeight * 1.5 + pairGap}
      dominantBaseline='middle'
      textAnchor={darkLabelInside ? 'end' : 'start'}
      fill={darkLabelInside ? het.white : het.black}
      className='text-smallest'
    >
      {darkBarLabel}
    </text>
  )
}
