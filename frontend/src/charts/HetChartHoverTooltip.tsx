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

  const transforms: string[] = []
  if (flipLeft) transforms.push('translateX(-100%)')
  if (flipUp) transforms.push('translateY(-100%)')

  const positionStyle: React.CSSProperties = {
    left: flipLeft ? `${x - OFFSET}px` : `${x + OFFSET}px`,
    top: flipUp ? `${y - OFFSET}px` : `${y + OFFSET}px`,
    // CSS min() is always correct — no JS viewport dependency for width
    maxWidth: 'min(320px, calc(100vw - 24px))',
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
