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
import { EXTRA_SPACE_AFTER_ALL, LABEL_SWAP_CUTOFF_PERCENT } from './constants'
import EndOfRateBarLabel from './EndOfRateBarLabel'

interface RoundedBarsWithLabelsProps {
  processedData: HetRow[]
  metricConfig: MetricConfig
  demographicType: DemographicType
  xScale: ScaleLinear<number, number>
  yScale: ScaleBand<string>
  getYPosition: (index: number, label: string) => number
  isTinyAndUp: boolean
  allIndex: number
  showTooltip: (data: BarChartTooltipData, x: number, y: number) => void
  hideTooltipDelayed: () => void
}

export default function RoundedBarsWithLabels({
  processedData,
  metricConfig,
  demographicType,
  xScale,
  yScale,
  getYPosition,
  isTinyAndUp,
  allIndex,
  showTooltip,
  hideTooltipDelayed,
}: RoundedBarsWithLabelsProps) {
  const barLabelBreakpoint = useMemo(() => {
    const maxValue = max(processedData, (d) => d[metricConfig.metricId]) || 0
    return maxValue * (LABEL_SWAP_CUTOFF_PERCENT / 100)
  }, [processedData, metricConfig.metricId])

  const barHeight = yScale.bandwidth() || 0
  const stepHeight = yScale.step()
  const normalGap = (stepHeight - barHeight) / 2
  const hitAreaWidth = xScale.range()[1]

  return processedData.map((d, index) => {
    const barWidth = xScale(d[metricConfig.metricId]) || 0
    const shouldLabelBeInside = d[metricConfig.metricId] > barLabelBreakpoint
    const yPosition = getYPosition(index, d[demographicType])
    const topGap =
      normalGap +
      (allIndex !== -1 && index === allIndex + 1
        ? EXTRA_SPACE_AFTER_ALL / 2
        : 0)
    const bottomGap =
      normalGap +
      (allIndex !== -1 && index === allIndex ? EXTRA_SPACE_AFTER_ALL / 2 : 0)
    const hitAreaY = -topGap
    const hitAreaHeight = barHeight + topGap + bottomGap

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
        onMouseLeave={hideTooltipDelayed}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          showTooltip(tooltipData, touch.clientX, touch.clientY)
        }}
        aria-label={barAriaLabel}
        role='img'
      >
        <rect
          x={0}
          y={hitAreaY}
          width={hitAreaWidth}
          height={hitAreaHeight}
          fill='transparent'
          aria-hidden
        />
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
