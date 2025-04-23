import { type RefObject, useCallback, useState } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { formatValue } from '../sharedBarChartPieces/helpers'
import type { BarChartTooltipData } from './BarChartTooltip'

export function useRateChartTooltip(
  containerRef: RefObject<HTMLDivElement | null>,
  metricConfig: MetricConfig,
  demographicType: string,
  isTinyAndUp: boolean,
) {
  const [tooltipData, setTooltipData] = useState<BarChartTooltipData | null>(
    null,
  )

  const handleTooltip = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      d: HetRow,
      isTouchEvent: boolean,
    ) => {
      const svgRect = containerRef.current?.getBoundingClientRect()
      if (!svgRect) return

      let clientX: number
      let clientY: number

      if (isTouchEvent) {
        const touchEvent = event as React.TouchEvent
        const touch = touchEvent.touches[0]
        clientX = touch.clientX
        clientY = touch.clientY
      } else {
        const mouseEvent = event as React.MouseEvent
        clientX = mouseEvent.clientX
        clientY = mouseEvent.clientY
      }

      const tooltipContent = `${d[demographicType]}: ${formatValue(
        d[metricConfig.metricId],
        metricConfig,
        isTinyAndUp,
      )}`

      setTooltipData({
        x: clientX - svgRect.left,
        y: clientY - svgRect.top,
        content: tooltipContent,
      })
    },
    [containerRef, demographicType, metricConfig],
  )

  const closeTooltip = useCallback(() => {
    setTooltipData(null)
  }, [])

  const handleContainerTouch = useCallback(
    (event: React.TouchEvent) => {
      const target = event.target as SVGElement
      if (target.tagName !== 'path') {
        closeTooltip()
      }
    },
    [closeTooltip],
  )

  return {
    tooltipData,
    handleTooltip,
    closeTooltip,
    handleContainerTouch,
  }
}
