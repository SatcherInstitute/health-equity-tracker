import { UNKNOWN_W } from '../../data/utils/Constants'
import { het } from '../../styles/DesignTokens'
import StyledPath from './StyledPath'
import { COLORS as C } from './constants'
import { createLineGenerator } from './helpers'
import type { XScale, YScale } from './types'

const SPARSE_LINE_OPACITY = 0.5

interface SparseDataInterpolationLineProps {
  segments: [string, number][][]
  group: string
  xScale: XScale
  yScale: YScale
}

export default function SparseDataInterpolationLine({
  segments,
  group,
  xScale,
  yScale,
}: SparseDataInterpolationLineProps) {
  const isUnknown = group === UNKNOWN_W
  const lineGen = createLineGenerator(xScale, yScale)
  const color = C(group)

  if (segments.length <= 1) return null

  return (
    <>
      {segments.map((segment, index) => {
        if (index === segments.length - 1) return null

        const nextSegment = segments[index + 1]
        const lastPoint = segment[segment.length - 1]
        const firstPoint = nextSegment[0]

        const yearDiff =
          new Date(firstPoint[0]).getFullYear() -
          new Date(lastPoint[0]).getFullYear()

        if (yearDiff <= 1) return null

        return (
          <g key={`gap-${index}`}>
            <StyledPath
              d={lineGen([lastPoint, firstPoint])}
              color={color || het.altBlack}
              isUnknown={isUnknown}
              strokeDasharray='1,5'
              strokeOpacity={SPARSE_LINE_OPACITY}
            />
          </g>
        )
      })}
    </>
  )
}
