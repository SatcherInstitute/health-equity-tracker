export interface BarChartTooltipData {
  group: string
  value: string
}

export default function BarChartTooltip({ group, value }: BarChartTooltipData) {
  return (
    <>
      <div className='font-semibold'>{group}</div>
      <div className='font-normal'>{value}</div>
    </>
  )
}
