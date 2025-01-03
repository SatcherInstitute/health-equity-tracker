export interface TooltipData {
  type: 'population' | 'distribution'
  value: number | null
  demographic: string
  event: React.MouseEvent
}

interface TooltipProps {
  data: TooltipData | null
}

export function StackedSharesBarChartTooltip({ data }: TooltipProps) {
  if (!data) return null

  const style = {
    position: 'absolute',
    left: `${data.event.clientX + 10}px`,
    top: `${data.event.clientY - 10}px`,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    padding: '8px',
    borderRadius: '4px',
    pointerEvents: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as const

  return (
    <div style={style}>
      <div style={{ fontWeight: 'bold' }}>{data.demographic}</div>
      <div>
        {data.type === 'population' ? '% of population: ' : '% of cases: '}
        {data.value?.toFixed(1)}%
      </div>
    </div>
  )
}
