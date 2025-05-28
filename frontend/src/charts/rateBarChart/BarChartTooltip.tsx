export interface BarChartTooltipData {
  x: number
  y: number
  content: string
}

interface BarChartTooltipProps {
  data: BarChartTooltipData | null
}

export default function BarChartTooltip({ data }: BarChartTooltipProps) {
  if (!data) return null
  const clickIsLeftHalfOfScreen = data.x < window.innerWidth / 2
  return (
    <div
      className='absolute z-top cursor-help rounded-sm bg-white p-3 text-alt-black text-title opacity-95 shadow-raised smMd:whitespace-nowrap'
      style={{
        left: `${data.x}px`,
        top: `${data.y}px`,
        transform: clickIsLeftHalfOfScreen
          ? 'translate(0, 5%)'
          : 'translate(-100%, 5%)',
      }}
    >
      {data.content}
    </div>
  )
}
