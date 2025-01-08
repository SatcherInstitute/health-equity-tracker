import type { ScaleBand, ScaleLinear } from 'd3'
import { useState } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { het } from '../../styles/DesignTokens'
import EndOfStackedPairLabels from './EndOfStackedPairLabels'

interface StackedBarsWithLabelsProps {
  data: HetRow[]
  lightMetric: MetricConfig
  darkMetric: MetricConfig
  xScale: ScaleLinear<number, number>
  yScale: ScaleBand<string>
  colors: {
    population: string
    distribution: string
  }
  barHeight: number
  pairGap: number
  borderRadius: number
  demographicType: DemographicType
  onTooltip: (params: {
    lightValue: number
    darkValue: number
    demographic: string
    event: React.MouseEvent
  }) => void
  onCloseTooltip: () => void
}

const StackedBarsWithLabels = (props: StackedBarsWithLabelsProps) => {
  const {
    data,
    lightMetric,
    darkMetric,
    xScale,
    yScale,
    colors,
    barHeight,
    pairGap,
    borderRadius,
    demographicType,
    onTooltip,
    onCloseTooltip,
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
          stroke: isHovered ? het.altBlack : 'none',
          strokeWidth: isHovered ? 1 : 0,
          strokeOpacity: 0.5,
        }

        return (
          <g
            key={d[demographicType]}
            onMouseEnter={(e) => {
              setHoveredDemographic(d[demographicType])
              onTooltip({
                lightValue,
                darkValue,
                demographic: d[demographicType],
                event: e,
              })
            }}
            onMouseLeave={() => {
              setHoveredDemographic(null)
              onCloseTooltip()
            }}
          >
            {/* POPULATION BAR */}
            {lightValue > 0 && (
              <path
                d={`
                M 0,${yPosition}
                L ${xScale(lightValue || 0) - borderRadius},${yPosition}
                Q ${xScale(lightValue || 0)},${yPosition} ${xScale(lightValue || 0)},${yPosition + borderRadius}
                L ${xScale(lightValue || 0)},${yPosition + barHeight - borderRadius}
                Q ${xScale(lightValue || 0)},${yPosition + barHeight} ${xScale(lightValue || 0) - borderRadius},${yPosition + barHeight}
                L 0,${yPosition + barHeight}
                Z
              `}
                fill={colors.population}
                {...strokeDetails}
              />
            )}

            {/* DISTRIBUTION BAR */}
            {darkValue > 0 && (
              <path
                d={`
                M 0,${yPosition + barHeight + pairGap}
                L ${xScale(darkValue || 0) - borderRadius},${yPosition + barHeight + pairGap}
                Q ${xScale(darkValue || 0)},${yPosition + barHeight + pairGap} ${xScale(darkValue || 0)},${yPosition + barHeight + pairGap + borderRadius}
                L ${xScale(darkValue || 0)},${yPosition + barHeight * 2 + pairGap - borderRadius}
                Q ${xScale(darkValue || 0)},${yPosition + barHeight * 2 + pairGap} ${xScale(darkValue || 0) - borderRadius},${yPosition + barHeight * 2 + pairGap}
                L 0,${yPosition + barHeight * 2 + pairGap}
                Z
              `}
                fill={colors.distribution}
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
