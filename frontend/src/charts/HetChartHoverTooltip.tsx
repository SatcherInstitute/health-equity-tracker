import { createPortal } from 'react-dom'

interface HetTooltipPanelProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function HetTooltipPanel({
  children,
  className = '',
  style,
}: HetTooltipPanelProps) {
  return (
    <div
      role='tooltip'
      className={`rounded-sm border border-alt-gray border-solid bg-alt-white p-3 font-medium font-sans-text text-small${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  )
}

interface HetChartHoverTooltipProps {
  x: number | null
  y: number | null
  children: React.ReactNode
  // enables pointer-events so interactive content (e.g. buttons) inside the tooltip is tappable
  interactive?: boolean
  // opt-in smooth position transitions; only trends chart uses this (date column scanning)
  animate?: boolean
}

export function HetChartHoverTooltip({
  x,
  y,
  children,
  interactive = false,
  animate = false,
}: HetChartHoverTooltipProps) {
  if (x === null || y === null) return null

  // Read directly from window — avoids stale useState on initial renders,
  // which caused flipLeft to be wrong and the tooltip to overflow off-screen.
  const vw = window.innerWidth
  const vh = window.innerHeight

  const OFFSET = 16
  const flipLeft = x > vw / 2
  const flipUp = y > vh / 2

  // Use right/bottom anchors when flipping so the browser grows the element
  // away from the cursor — avoids the implicit width constraint that occurs when
  // left is near the viewport right edge (browser limits width to vw - left).
  const positionStyle: React.CSSProperties = {
    ...(flipLeft
      ? { right: `${vw - x + OFFSET}px` }
      : { left: `${x + OFFSET}px` }),
    ...(flipUp
      ? { bottom: `${vh - y + OFFSET}px` }
      : { top: `${y + OFFSET}px` }),
    maxWidth: 'min(320px, calc(100vw - 24px))',
    ...(animate && {
      transition:
        'left 300ms ease-linear, right 300ms ease-linear, top 300ms ease-linear, bottom 300ms ease-linear',
    }),
  }

  return createPortal(
    <HetTooltipPanel
      className={
        interactive ? 'fixed z-top' : 'pointer-events-none fixed z-top'
      }
      style={positionStyle}
    >
      {children}
    </HetTooltipPanel>,
    document.body,
  )
}
