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
      className={`whitespace-nowrap rounded-sm border border-alt-gray border-solid bg-alt-white p-3 font-medium font-sans-text text-small${className ? ` ${className}` : ''}`}
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

  const flipLeft = x > window.innerWidth / 2
  const flipUp = y > window.innerHeight / 2

  return (
    <HetTooltipPanel
      className={
        interactive ? 'fixed z-top' : 'pointer-events-none fixed z-top'
      }
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transition: 'left 300ms ease-linear, top 300ms ease-linear',
        transform: `translate(${flipLeft ? 'calc(-100% - 16px)' : '16px'}, ${flipUp ? 'calc(-100% - 16px)' : '16px'})`,
      }}
    >
      {children}
    </HetTooltipPanel>
  )
}
