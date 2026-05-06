import type { ScaleBand, ScaleLinear } from 'd3'
import { useState } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { het } from '../../styles/DesignTokens'
import { buildBarPair } from '../sharedBarChartPieces/helpers'
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
              <path d={lightBar} fill={colors.population} {...strokeDetails} />
            )}

            {/* DISTRIBUTION BAR */}
            {darkValue > 0 && (
              <path d={darkBar} fill={colors.distribution} {...strokeDetails} />
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
