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
  interactive?: boolean
}

export function HetChartHoverTooltip({
  x,
  y,
  children,
  interactive = false,
}: HetChartHoverTooltipProps) {
  if (x === null || y === null) return null

  const OFFSET = 16
  const EDGE_PADDING = 12
  const flipLeft = x > window.innerWidth / 2
  const flipUp = y > window.innerHeight / 2

  const positionStyle: React.CSSProperties = {
    transition:
      'left 300ms ease-linear, right 300ms ease-linear, top 300ms ease-linear, bottom 300ms ease-linear',
  }

  if (flipLeft) {
    positionStyle.right = `${window.innerWidth - x + OFFSET}px`
    positionStyle.maxWidth = `${x - OFFSET - EDGE_PADDING}px`
  } else {
    positionStyle.left = `${x + OFFSET}px`
    positionStyle.maxWidth = `${window.innerWidth - x - OFFSET - EDGE_PADDING}px`
  }

  if (flipUp) {
    positionStyle.bottom = `${window.innerHeight - y + OFFSET}px`
  } else {
    positionStyle.top = `${y + OFFSET}px`
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
