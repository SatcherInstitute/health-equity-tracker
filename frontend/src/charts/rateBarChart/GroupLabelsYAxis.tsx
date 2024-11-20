import type { ScaleBand } from 'd3'
import type { Fips } from '../../data/utils/Fips'
import { getComparisonAllSubGroupLines } from './helpers'

type WrappedLabel = {
  original: string
  lines: string[]
}

interface GroupLabelsYAxisProps {
  fips: Fips
  useIntersectionalComparisonAlls?: boolean
  comparisonAllSubGroup?: string
  wrappedLabels: WrappedLabel[]
  yScale: ScaleBand<string>
  getYPosition: (index: number, label: string) => number
}

export default function GroupLabelsYAxis(props: GroupLabelsYAxisProps) {
  return (
    <g className='y-axis' aria-hidden='true' tabIndex={-1}>
      {props.wrappedLabels.map((label: any, index: number) => {
        if (label.original === 'All' && props.useIntersectionalComparisonAlls) {
          label.lines = getComparisonAllSubGroupLines(
            props.fips,
            props.comparisonAllSubGroup,
          )
        }
        const yPosition = props.getYPosition(index, label.original)
        return (
          <g
            key={`${label.original}-${index}`}
            transform={`translate(0,${yPosition})`}
          >
            {label.lines.map((line: string, lineIndex: number) => {
              return (
                <text
                  key={lineIndex}
                  x={-5}
                  y={
                    props.yScale.bandwidth() / 2 -
                    (label.lines.length - 1) * 8 +
                    lineIndex * 12
                  }
                  dy='.32em'
                  textAnchor='end'
                  className='text-smallest'
                >
                  {line}
                </text>
              )
            })}
          </g>
        )
      })}
    </g>
  )
}
