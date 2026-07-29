const SWATCH_SIZE = 15

interface LegendItemProps {
  color: string
  label: string
  // white swatches need an outline or they read as an empty gap in the legend
  borderColor?: string
}

export default function LegendItem({
  color,
  label,
  borderColor,
}: LegendItemProps) {
  return (
    <div className='flex items-center gap-1'>
      <svg width={SWATCH_SIZE} height={SWATCH_SIZE} className='shrink-0'>
        <rect
          width={SWATCH_SIZE}
          height={SWATCH_SIZE}
          fill={color}
          {...(borderColor && { stroke: borderColor, strokeWidth: 1 })}
        />
      </svg>
      <span className='whitespace-nowrap text-smallest'>{label}</span>
    </div>
  )
}
