import StyledPath from './StyledPath'
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
        <IsolatedYearMiniLine x={x} y={y} color={color} isUnknown={isUnknown} />
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

  // Multiple adjacent data points SOLID LINE
  return (
    <>
      <StyledPath
        d={lineGen(segment as any)}
        color={color}
        isUnknown={isUnknown}
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

interface IsolatedYearMiniLineProps {
  x: number
  y: number
  color: string
  isUnknown: boolean
}

function IsolatedYearMiniLine({
  x,
  y,
  color,
  isUnknown,
}: IsolatedYearMiniLineProps) {
  return (
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
  )
}
