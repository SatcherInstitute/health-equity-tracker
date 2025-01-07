import { useEffect, useRef, useState } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'

export interface TooltipData {
  lightValue: number | null
  darkValue: number | null
  demographic: string
  event: React.MouseEvent
}

interface TooltipProps {
  lightMetric: MetricConfig
  darkMetric: MetricConfig
  data: TooltipData | null
}

export function StackedSharesBarChartTooltip(props: TooltipProps) {
  const { data, lightMetric, darkMetric } = props
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltipRef.current) {
        const viewportWidth = window.innerWidth
        const mouseX = e.clientX
        const mouseY = e.clientY
        const tooltipWidth = tooltipRef.current.offsetWidth
        const tooltipHeight = tooltipRef.current.offsetHeight
        const padding = 16

        // Check if mouse is in the right half of the viewport
        const isRightSide = mouseX > viewportWidth / 2
        const isBottomSide = mouseY > window.innerHeight / 2

        // Calculate left position
        const left = isRightSide
          ? mouseX - tooltipWidth - padding
          : mouseX + padding

        const tooltipVerticalAdjustment = isBottomSide ? -50 : 50

        // Calculate top position
        const top =
          Math.max(
            padding,
            Math.min(
              mouseY - tooltipHeight / 2,
              window.innerHeight - tooltipHeight - padding,
            ),
          ) + tooltipVerticalAdjustment

        setPosition({ left, top })
      }
    }

    if (data) {
      window.addEventListener('mousemove', handleMouseMove)
      // Initial position
      handleMouseMove(data.event.nativeEvent)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [data])

  if (!data) return null

  return (
    <div
      ref={tooltipRef}
      className='pointer-events-none fixed border border-borderColor bg-white p-2 opacity-95 shadow-lg backdrop-blur-sm'
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transition: 'left 0.15s ease-out, top 0.15s ease-out',
      }}
    >
      <div className='font-semibold'>{data.demographic}</div>
      <div className='font-light text-sm'>
        <span>
          {data.lightValue?.toFixed(1)}
          {lightMetric.shortLabel}
        </span>
        {' vs. '}
        <span>
          {data.darkValue?.toFixed(1)}
          {darkMetric.shortLabel}
        </span>
      </div>
    </div>
  )
}
