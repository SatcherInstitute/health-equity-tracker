import { useCallback, useState } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { formatValue } from '../sharedBarChartPieces/helpers'
import type { BarChartTooltipData } from './BarChartTooltip'

export function useRateChartTooltip(
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
      let clientX: number
      let clientY: number

      if (isTouchEvent) {
        const touch = (event as React.TouchEvent).touches[0]
        clientX = touch.clientX
        clientY = touch.clientY
      } else {
        const mouseEvent = event as React.MouseEvent
        clientX = mouseEvent.clientX
        clientY = mouseEvent.clientY
      }

      setTooltipData({
        x: clientX,
        y: clientY,
        group: d[demographicType] as string,
        value: formatValue(d[metricConfig.metricId], metricConfig, isTinyAndUp),
      })
    },
    [demographicType, metricConfig, isTinyAndUp],
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
