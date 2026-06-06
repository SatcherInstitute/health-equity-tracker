import { useCallback, useState } from 'react'

export interface TooltipPosition {
  x: number
  y: number
}

export function useChartTooltip<T>() {
  const [tooltipData, setTooltipData] = useState<T | null>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null)

  const showTooltip = useCallback((data: T, x: number, y: number) => {
    setTooltipData(data)
    setTooltipPos({ x, y })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltipData(null)
    setTooltipPos(null)
  }, [])

  return { tooltipData, tooltipPos, showTooltip, hideTooltip }
}
