import { useViewportSize } from '../utils/hooks/useViewportSize'

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
  const { width: vw, height: vh } = useViewportSize()

  if (x === null || y === null) return null

  const OFFSET = 16
  const EDGE_PADDING = 12
  const flipLeft = x > vw / 2
  const flipUp = y > vh / 2

  // Always anchor with left+top and use transform to offset when flipping sides.
  // This ensures only left and top ever animate — if we used right/bottom on a
  // flip, both sides would transition simultaneously and the tooltip would fly
  // across the screen.
  const transforms: string[] = []
  if (flipLeft) transforms.push('translateX(-100%)')
  if (flipUp) transforms.push('translateY(-100%)')

  const MIN_WIDTH = 160
  const MAX_WIDTH = 320

  const availableWidth = flipLeft
    ? x - OFFSET - EDGE_PADDING
    : vw - x - OFFSET - EDGE_PADDING

  const positionStyle: React.CSSProperties = {
    left: flipLeft ? `${x - OFFSET}px` : `${x + OFFSET}px`,
    top: flipUp ? `${y - OFFSET}px` : `${y + OFFSET}px`,
    maxWidth: `${Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, availableWidth))}px`,
    ...(transforms.length > 0 && { transform: transforms.join(' ') }),
    ...(animate && {
      transition: 'left 300ms ease-linear, top 300ms ease-linear',
    }),
  }

  return (
    <HetTooltipPanel
      className={
        interactive ? 'fixed z-top' : 'pointer-events-none fixed z-top'
      }
      style={positionStyle}
    >
      {children}
    </HetTooltipPanel>
  )
}
