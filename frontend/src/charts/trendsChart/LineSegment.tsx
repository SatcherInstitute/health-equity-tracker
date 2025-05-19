import type { XScale, YScale } from './types'

const SINGLE_YEAR_LENGTH = 30

interface LineSegmentProps {
  segment: [string, number][]
  lineGen: any
  color: string
  isUnknown: boolean
  showDots: boolean
  xScale: XScale
  yScale: YScale
}

export default function LineSegment({
  segment,
  lineGen,
  color,
  isUnknown,
  showDots,
  xScale,
  yScale,
}: LineSegmentProps) {
  if (segment.length === 1) {
    const [date, amount] = segment[0]
    const x = xScale(new Date(date))
    const y = yScale(amount)
    if (x === undefined || y === undefined) return null

    return (
      <>
        <line
          x1={x - SINGLE_YEAR_LENGTH / 2}
          y1={y}
          x2={x + SINGLE_YEAR_LENGTH / 2}
          y2={y}
          stroke={color}
          strokeWidth={isUnknown ? 5.5 : 2.5}
          style={
            isUnknown
              ? { strokeLinecap: 'butt', stroke: 'url(#gradient)' }
              : { strokeLinecap: 'round' }
          }
        />
        {showDots && (
          <circle
            cx={x}
            cy={y}
            r={isUnknown ? 4 : 3}
            fill={color}
            stroke='white'
            strokeWidth={1}
          />
        )}
      </>
    )
  }

  // Multiple points case
  return (
    <>
      <path
        className={`fill-none ${isUnknown ? 'stroke-5.5' : 'stroke-2.5'}`}
        d={lineGen(segment as any) ?? ''}
        stroke={color}
        strokeDasharray='none'
        style={
          isUnknown
            ? { strokeLinecap: 'butt', stroke: 'url(#gradient)' }
            : { strokeLinecap: 'round' }
        }
      />
      {showDots &&
        segment.map(([date, amount], pointIndex) => {
          const x = xScale(new Date(date))
          const y = yScale(amount)
          if (x === undefined || y === undefined) return null

          return (
            <circle
              key={`point-${pointIndex}`}
              cx={x}
              cy={y}
              r={isUnknown ? 4 : 3}
              fill={color}
              stroke='white'
              strokeWidth={1}
            />
          )
        })}
    </>
  )
}
