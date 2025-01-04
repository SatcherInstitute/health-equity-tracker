import type { ScaleBand } from 'd3'
import { useMemo } from 'react'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import GroupLabelsYAxis from './GroupLabelsYAxis'
import { MARGIN, Y_AXIS_LABEL_HEIGHT } from './constants'
import { wrapLabel } from './helpers'

interface YAxisProps {
  demographicType: DemographicType
  isSmAndUp: boolean
  processedData: HetRow[]
  maxLabelWidth: number
  yScale: ScaleBand<string>
  getYPosition: (index: number, label: string) => number
  fips: Fips
  innerHeight: number
}
export default function YAxis(props: YAxisProps) {
  console.log(props.processedData)

  const wrappedLabels = useMemo(() => {
    return props.processedData.map((d) => ({
      original: d[props.demographicType],
      lines: wrapLabel(d[props.demographicType], props.maxLabelWidth),
    }))
  }, [props.processedData, props.demographicType])

  console.log(wrappedLabels)

  return (
    <g>
      {props.isSmAndUp && (
        <g>
          <text
            transform={`translate(${-MARGIN.left + Y_AXIS_LABEL_HEIGHT},${props.innerHeight / 2}) rotate(-90)`}
            textAnchor='middle'
            className='m-0 cursor-vertical-text p-0 font-semibold text-smallest'
            aria-label={'Y Axis Label'}
          >
            {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]}
          </text>
        </g>
      )}

      <GroupLabelsYAxis
        {...props}
        wrappedLabels={wrappedLabels}
        yScale={props.yScale}
        getYPosition={props.getYPosition}
        fips={props.fips}
      />
    </g>
  )
}
