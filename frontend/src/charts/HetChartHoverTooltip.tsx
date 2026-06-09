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
      className={`rounded-sm border border-alt-gray border-solid bg-alt-white/[0.98] p-3 font-medium font-sans-text shadow-lg sm:backdrop-blur-sm text-small${className ? ` ${className}` : ''}`}
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
  // set to true when the tooltip is rendered inside a modal (uses z-multimap-modal-tooltip to clear the dialog z-index)
  inModal?: boolean
}

export function HetChartHoverTooltip({
  x,
  y,
  children,
  interactive = false,
  animate = false,
  inModal = false,
}: HetChartHoverTooltipProps) {
  const zIndexClass = inModal ? 'z-multimap-modal-tooltip' : 'z-top'
  if (x === null || y === null) return null

  // Read directly from window — avoids stale useState on initial renders,
  // which caused flipLeft to be wrong and the tooltip to overflow off-screen.
  const vw = window.innerWidth
  const vh = window.innerHeight

  const OFFSET = 16
  const PAD = 12
  // Compute pixel width to match the CSS value so clamping math is exact.
  const tooltipWidth = Math.min(320, Math.round(vw * 0.6))

  // Prefer showing to the right of the cursor; flip left when near the right edge.
  const desiredLeft = x > vw / 2 ? x - OFFSET - tooltipWidth : x + OFFSET
  // Clamp so the tooltip never overflows either edge.
  const left = Math.max(PAD, Math.min(vw - tooltipWidth - PAD, desiredLeft))

  const flipUp = y > vh / 2

  const positionStyle: React.CSSProperties = {
    left: `${left}px`,
    width: `${tooltipWidth}px`,
    ...(flipUp
      ? { bottom: `${vh - y + OFFSET}px` }
      : { top: `${y + OFFSET}px` }),
    ...(animate && {
      transition:
        'left 300ms ease-linear, top 300ms ease-linear, bottom 300ms ease-linear',
    }),
  }

  return createPortal(
    <HetTooltipPanel
      className={
        interactive
          ? `fixed ${zIndexClass}`
          : `pointer-events-none fixed ${zIndexClass}`
      }
      style={positionStyle}
    >
      {children}
    </HetTooltipPanel>,
    document.body,
  )
}
