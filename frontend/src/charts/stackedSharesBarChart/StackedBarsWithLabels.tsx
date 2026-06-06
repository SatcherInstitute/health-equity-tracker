import type { ScaleBand, ScaleLinear } from 'd3'
import { useState } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { colors } from '../../styles/tokens/colors'
import { buildBarPair } from '../sharedBarChartPieces/helpers'
import EndOfStackedPairLabels from './EndOfStackedPairLabels'
import type { StackedBarTooltipData } from './StackedSharesBarChartTooltip'

interface StackedBarsWithLabelsProps {
  data: HetRow[]
  lightMetric: MetricConfig
  darkMetric: MetricConfig
  xScale: ScaleLinear<number, number>
  yScale: ScaleBand<string>
  barColors: {
    population: string
    distribution: string
  }
  barHeight: number
  pairGap: number
  demographicType: DemographicType
  showTooltip: (data: StackedBarTooltipData, x: number, y: number) => void
  hideTooltip: () => void
}

const StackedBarsWithLabels = (props: StackedBarsWithLabelsProps) => {
  const {
    data,
    lightMetric,
    darkMetric,
    xScale,
    yScale,
    barColors,
    barHeight,
    pairGap,
    demographicType,
    showTooltip,
    hideTooltip,
  } = props

  const [hoveredDemographic, setHoveredDemographic] = useState<string | null>(
    null,
  )

  return (
    <>
      {data.map((d) => {
        const yPosition = yScale(d[demographicType]) || 0
        const lightValue = d[lightMetric.metricId]
        const darkValue = d[darkMetric.metricId]
        const isHovered = hoveredDemographic === d[demographicType]

        const strokeDetails = {
          stroke: isHovered ? colors.altBlack : 'none',
          strokeWidth: isHovered ? 1 : 0,
          strokeOpacity: 0.5,
        }

        const { lightBar, darkBar } = buildBarPair(
          lightValue,
          darkValue,
          yPosition,
          barHeight,
          pairGap,
          xScale,
        )

        const a11yLabelForPairedBars = `${d[demographicType]}:  ${lightValue} ${lightMetric.shortLabel} vs. ${darkValue} ${darkMetric.shortLabel}`

        return (
          <g
            aria-label={a11yLabelForPairedBars}
            role='img'
            tabIndex={0}
            key={d[demographicType]}
            onMouseEnter={(e) => {
              setHoveredDemographic(d[demographicType])
              showTooltip(
                { lightValue, darkValue, demographic: d[demographicType] },
                e.clientX,
                e.clientY,
              )
            }}
            onMouseLeave={() => {
              setHoveredDemographic(null)
              hideTooltip()
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0]
              setHoveredDemographic(d[demographicType])
              showTooltip(
                { lightValue, darkValue, demographic: d[demographicType] },
                touch.clientX,
                touch.clientY,
              )
            }}
          >
            {/* POPULATION BAR */}
            {lightValue > 0 && (
              <path
                d={lightBar}
                fill={barColors.population}
                {...strokeDetails}
              />
            )}

            {/* DISTRIBUTION BAR */}
            {darkValue > 0 && (
              <path
                d={darkBar}
                fill={barColors.distribution}
                {...strokeDetails}
              />
            )}

            {/* BAR LABELS */}
            <EndOfStackedPairLabels
              darkValue={darkValue}
              darkMetric={darkMetric}
              xScale={xScale}
              yPosition={yPosition}
              barHeight={barHeight}
              pairGap={pairGap}
            />
          </g>
        )
      })}
    </>
  )
}

export default StackedBarsWithLabels
