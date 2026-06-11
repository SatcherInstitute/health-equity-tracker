import { useCallback, useEffect, useRef, useState } from 'react'

export interface TooltipPosition {
  x: number
  y: number
}

export function useChartTooltip<T>() {
  const [tooltipData, setTooltipData] = useState<T | null>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTooltip = useCallback((data: T, x: number, y: number) => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    setTooltipData(data)
    setTooltipPos({ x, y })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltipData(null)
    setTooltipPos(null)
  }, [])

  // Deferred hide: cancels if showTooltip fires within the delay window.
  // Use this for mousemove dead-zone checks so the tooltip glides between
  // discrete elements rather than blinking off between them.
  const hideTooltipDelayed = useCallback(
    (delay = 160) => {
      if (hideTimer.current !== null) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(hideTooltip, delay)
    },
    [hideTooltip],
  )

  useEffect(() => {
    window.addEventListener('scroll', hideTooltip, { passive: true })
    window.addEventListener('wheel', hideTooltip, { passive: true })
    return () => {
      window.removeEventListener('scroll', hideTooltip)
      window.removeEventListener('wheel', hideTooltip)
    }
  }, [hideTooltip])

  return {
    tooltipData,
    tooltipPos,
    showTooltip,
    hideTooltip,
    hideTooltipDelayed,
  }
}
