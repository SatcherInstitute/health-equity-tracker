import type { ScaleLinear } from 'd3'
import { getNumTicks } from './helpers'

interface VerticalGridlinesProps {
  width: number
  height: number
  xScale: ScaleLinear<number, number>
}

export default function VerticalGridlines(props: VerticalGridlinesProps) {
  const numTicks = getNumTicks(props.width)

  return (
    <g className='gridlines'>
      {props.xScale.ticks(numTicks).map((tick, index) => (
        <line
          key={`gridline-${index}`}
          x1={props.xScale(tick)}
          x2={props.xScale(tick)}
          y1={0}
          y2={props.height}
          className='stroke-timberwolf'
        />
      ))}
    </g>
  )
}
