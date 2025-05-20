import { UNKNOWN_W } from '../../data/utils/Constants'
import LineSegment from './LineSegment'
import SparseDataInterpolationLines from './SparseDataInterpolationLines'
import { COLORS as C } from './constants'
import {
  createLineGenerator,
  getGroupAccessibilityDescription,
  hasDataGaps,
  splitIntoConsecutiveSegments,
} from './helpers'
import type { XScale, YScale } from './types'

interface GroupLineProps {
  group: string
  data: [string, number][]
  xScale: XScale
  yScale: YScale
  valuesArePct: boolean
}

export default function GroupLine({
  group,
  data,
  xScale,
  yScale,
  valuesArePct,
}: GroupLineProps) {
  const validData = data.filter(
    ([date, amount]) => date != null && amount != null,
  )

  const sortedData = [...validData].sort((a, b) => a[1] - b[1])
  const isUnknown = group === UNKNOWN_W
  const segments = splitIntoConsecutiveSegments(validData)
  const shouldShowDots = hasDataGaps(segments)
  const lineGen = createLineGenerator(xScale, yScale)
  const color = C(group)

  const a11yDescription = getGroupAccessibilityDescription(
    group,
    sortedData,
    valuesArePct,
  )

  return (
    <g aria-label={a11yDescription}>
      <title>{a11yDescription}</title>

      <SparseDataInterpolationLines
        segments={segments}
        group={group}
        xScale={xScale}
        yScale={yScale}
      />

      {segments.map((segment, index) => (
        <g key={`segment-${index}`}>
          <LineSegment
            segment={segment}
            lineGen={lineGen}
            color={color as string}
            isUnknown={isUnknown}
            showDots={shouldShowDots}
            xScale={xScale}
            yScale={yScale}
          />
        </g>
      ))}
    </g>
  )
}
