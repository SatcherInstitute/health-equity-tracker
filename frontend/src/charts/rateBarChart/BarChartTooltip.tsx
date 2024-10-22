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
      className='bg-white text-altBlack rounded-sm p-3 text-title absolute cursor-help z-top shadow-raised opacity-95 smMd:whitespace-nowrap'
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
