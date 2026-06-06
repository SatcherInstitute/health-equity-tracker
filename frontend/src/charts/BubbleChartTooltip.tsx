export interface BubbleChartTooltipData {
  fipsName: string
  raceAndEthnicity: string
  xLabel: string
  xValue: number
  yLabel: string
  yValue: number
  population: number
}

export function BubbleChartTooltip({ data }: { data: BubbleChartTooltipData }) {
  return (
    <>
      <div className='font-semibold'>
        {data.fipsName}, {data.raceAndEthnicity}
      </div>
      <div className='font-normal'>
        {data.xLabel}: {data.xValue}
      </div>
      <div className='font-normal'>
        {data.yLabel}: {data.yValue}
      </div>
      <div className='font-normal'>
        Population: {data.population.toLocaleString()}
      </div>
    </>
  )
}
