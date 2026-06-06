import { max, type ScaleBand, type ScaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { colors } from '../../styles/tokens/colors'
import {
  buildRoundedBarString,
  formatValue,
} from '../sharedBarChartPieces/helpers'
import type { BarChartTooltipData } from './BarChartTooltip'
import { LABEL_SWAP_CUTOFF_PERCENT } from './constants'
import EndOfRateBarLabel from './EndOfRateBarLabel'

interface RoundedBarsWithLabelsProps {
  processedData: HetRow[]
  metricConfig: MetricConfig
  demographicType: DemographicType
  xScale: ScaleLinear<number, number>
  yScale: ScaleBand<string>
  getYPosition: (index: number, label: string) => number
  isTinyAndUp: boolean
  showTooltip: (data: BarChartTooltipData, x: number, y: number) => void
  hideTooltip: () => void
}

export default function RoundedBarsWithLabels({
  processedData,
  metricConfig,
  demographicType,
  xScale,
  yScale,
  getYPosition,
  isTinyAndUp,
  showTooltip,
  hideTooltip,
}: RoundedBarsWithLabelsProps) {
  const barLabelBreakpoint = useMemo(() => {
    const maxValue = max(processedData, (d) => d[metricConfig.metricId]) || 0
    return maxValue * (LABEL_SWAP_CUTOFF_PERCENT / 100)
  }, [processedData, metricConfig.metricId])

  return processedData.map((d, index) => {
    const barWidth = xScale(d[metricConfig.metricId]) || 0
    const shouldLabelBeInside = d[metricConfig.metricId] > barLabelBreakpoint
    const yPosition = getYPosition(index, d[demographicType])
    const barHeight = yScale.bandwidth() || 0

    const barLabelColor =
      shouldLabelBeInside && d[demographicType] !== 'All'
        ? 'fill-alt-white'
        : 'fill-current'

    const roundedBarString = buildRoundedBarString({
      width: barWidth,
      height: barHeight,
    })

    if (!roundedBarString) return null

    const barAriaLabel = `${d[demographicType]}: ${d[metricConfig.metricId]} ${metricConfig.shortLabel}`
    const tooltipData: BarChartTooltipData = {
      group: d[demographicType] as string,
      value: formatValue(
        d[metricConfig.metricId] as number,
        metricConfig,
        isTinyAndUp,
      ),
    }

    return (
      <g
        key={index + barAriaLabel}
        transform={`translate(0,${yPosition})`}
        onMouseEnter={(e) => showTooltip(tooltipData, e.clientX, e.clientY)}
        onMouseLeave={hideTooltip}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          showTooltip(tooltipData, touch.clientX, touch.clientY)
        }}
        aria-label={barAriaLabel}
        role='img'
      >
        <path
          d={roundedBarString}
          key={'path' + index + barAriaLabel}
          style={{
            fill:
              d[demographicType] === 'All'
                ? colors.timeYellow
                : colors.altGreen,
          }}
          aria-hidden
        />
        <EndOfRateBarLabel
          metricConfig={metricConfig}
          d={d}
          shouldLabelBeInside={shouldLabelBeInside}
          barWidth={barWidth}
          yScale={yScale}
          barLabelColor={barLabelColor}
          isTinyAndUp={isTinyAndUp}
        />
      </g>
    )
  })
}
