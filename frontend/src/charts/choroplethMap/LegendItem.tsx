interface LegendItemProps {
  color: string
  label: string
}

export default function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className='flex items-center gap-2'>
      <svg width={15} height={15} className='shrink-0'>
        <rect width={15} height={15} fill={color} />
      </svg>
      <span className='text-sm'>{label}</span>
    </div>
  )
}
