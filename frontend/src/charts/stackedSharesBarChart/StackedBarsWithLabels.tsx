import type { ScaleBand, ScaleLinear } from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import EndOfStackedPairLabels from './EndOfStackedBarLabel'

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
    type: 'population' | 'distribution'
    value: number
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
  return (
    <>
      {data.map((d) => {
        const yPosition = yScale(d[demographicType]) || 0
        const lightValue = d[lightMetric.metricId]
        const darkValue = d[darkMetric.metricId]

        return (
          <g key={d[demographicType]}>
            {/* POPULATION BAR */}
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
              onMouseEnter={(e) =>
                onTooltip({
                  type: 'population',
                  value: lightValue,
                  demographic: d[demographicType],
                  event: e,
                })
              }
              onMouseLeave={onCloseTooltip}
            />

            {/* DISTRIBUTION BAR */}
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
              onMouseEnter={(e) =>
                onTooltip({
                  type: 'distribution',
                  value: darkValue,
                  demographic: d[demographicType],
                  event: e,
                })
              }
              onMouseLeave={onCloseTooltip}
            />

            {/* BAR LABELS */}

            <EndOfStackedPairLabels
              lightValue={lightValue}
              lightMetric={lightMetric}
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
