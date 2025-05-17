const SWATCH_SIZE = 15

interface LegendItemProps {
  color: string
  label: string
}

export default function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className='flex items-center gap-1'>
      <svg width={SWATCH_SIZE} height={SWATCH_SIZE} className='shrink-0'>
        <rect width={SWATCH_SIZE} height={SWATCH_SIZE} fill={color} />
      </svg>
      <span className='text-smallest'>{label}</span>
    </div>
  )
}
