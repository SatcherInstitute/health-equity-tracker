interface StyledPathProps {
  d: string | null
  color: string
  isUnknown: boolean
  strokeWidth?: string
  strokeDasharray?: string
  strokeOpacity?: number
}

export default function StyledPath({
  d,
  color,
  isUnknown,
  strokeWidth = isUnknown ? 'stroke-5.5' : 'stroke-2.5',
  strokeDasharray = 'none',
  strokeOpacity = 1,
}: StyledPathProps) {
  if (!d) return null

  return (
    <path
      className={`fill-none ${strokeWidth}`}
      d={d}
      stroke={color}
      strokeDasharray={strokeDasharray}
      strokeOpacity={strokeOpacity}
      style={
        isUnknown
          ? { strokeLinecap: 'butt', stroke: 'url(#gradient)' }
          : { strokeLinecap: 'round' }
      }
    />
  )
}
