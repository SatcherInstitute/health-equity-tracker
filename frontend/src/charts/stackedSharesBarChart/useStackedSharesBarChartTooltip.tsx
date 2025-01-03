import { useCallback, useState } from 'react'
import type { TooltipData } from './StackedSharesBarChartTooltip'

export function useStackedSharesBarChartTooltip() {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)

  const handleTooltip = useCallback((data: TooltipData) => {
    setTooltipData(data)
  }, [])

  const closeTooltip = useCallback(() => {
    setTooltipData(null)
  }, [])

  const handleContainerTouch = useCallback(() => {
    // Close tooltip on touch devices to prevent it getting stuck
    closeTooltip()
  }, [closeTooltip])

  return {
    tooltipData,
    handleTooltip,
    closeTooltip,
    handleContainerTouch,
  }
}
