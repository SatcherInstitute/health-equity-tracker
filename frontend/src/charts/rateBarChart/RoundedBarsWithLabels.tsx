import { max, type ScaleBand, type ScaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { buildRoundedBarString } from '../sharedBarChartPieces/helpers'
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
  handleTooltip: any
  closeTooltip: any
}

export default function RoundedBarsWithLabels(
  props: RoundedBarsWithLabelsProps,
) {
  const barLabelBreakpoint = useMemo(() => {
    const maxValue =
      max(props.processedData, (d) => d[props.metricConfig.metricId]) || 0
    return maxValue * (LABEL_SWAP_CUTOFF_PERCENT / 100)
  }, [props.processedData, props.metricConfig.metricId])

  return props.processedData.map((d, index) => {
    const barWidth = props.xScale(d[props.metricConfig.metricId]) || 0
    const shouldLabelBeInside =
      d[props.metricConfig.metricId] > barLabelBreakpoint
    const yPosition = props.getYPosition(index, d[props.demographicType])
    const barHeight = props.yScale.bandwidth() || 0

    const barLabelColor =
      shouldLabelBeInside && d[props.demographicType] !== 'All'
        ? 'fill-white'
        : 'fill-current'

    const roundedBarString = buildRoundedBarString({
      width: barWidth,
      height: barHeight,
    })

    if (!roundedBarString) return null

    const barAriaLabel = `${d[props.demographicType]}: ${d[props.metricConfig.metricId]} ${props.metricConfig.shortLabel}`

    return (
      <g
        key={index + barAriaLabel}
        transform={`translate(0,${yPosition})`}
        onMouseMove={(e) => props.handleTooltip(e, d, false)}
        onMouseLeave={props.closeTooltip}
        onTouchStart={(e) => {
          props.handleTooltip(e, d, true)
        }}
        aria-label={barAriaLabel}
      >
        <path
          d={roundedBarString}
          key={`path${index}${barAriaLabel}`}
          className={
            d[props.demographicType] === 'All'
              ? 'fill-time-yellow'
              : 'fill-alt-green'
          }
          aria-hidden
        />
        <EndOfRateBarLabel
          {...props}
          d={d}
          shouldLabelBeInside={shouldLabelBeInside}
          barWidth={barWidth}
          yScale={props.yScale}
          barLabelColor={barLabelColor}
          isTinyAndUp={props.isTinyAndUp}
        />
      </g>
    )
  })
}
