import { max, type ScaleBand, type ScaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { LABEL_SWAP_CUTOFF_PERCENT } from './constants'
import EndOfBarLabel from './EndOfBarLabel'
import { buildRoundedBarString } from './helpers'

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

    const barLabelColor =
      shouldLabelBeInside && d[props.demographicType] !== 'All'
        ? 'fill-white'
        : 'fill-current'

    const roundedBarString = buildRoundedBarString(barWidth, props.yScale)

    if (!roundedBarString) return <></>

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
      >
        <path
          d={roundedBarString}
          key={'path' + index + barAriaLabel}
          className={
            d[props.demographicType] === 'All'
              ? 'fill-timeYellow'
              : 'fill-altGreen'
          }
          aria-label={barAriaLabel}
        />
        <EndOfBarLabel
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
