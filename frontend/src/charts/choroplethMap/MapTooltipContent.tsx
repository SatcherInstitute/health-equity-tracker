import { Fips } from '../../data/utils/Fips'
import type { MapTooltipData } from './types'

interface MapTooltipContentProps {
  data: MapTooltipData
  onExplore: (fips: Fips) => void
  isTouch?: boolean
}

export function MapTooltipContent({
  data,
  onExplore,
  isTouch = false,
}: MapTooltipContentProps) {
  return (
    <>
      <div className='font-semibold'>
        {data.name} {data.geographyType}
        {!data.isSummaryLegend && !isTouch && (
          <span className='ml-2 font-normal text-alt-dark text-small italic'>
            · click to explore
          </span>
        )}
      </div>
      {!data.isSummaryLegend && isTouch && (
        <button
          type='button'
          className='mt-1 cursor-pointer border-0 bg-transparent p-0 text-left text-alt-green underline'
          onClick={() => onExplore(new Fips(data.featureId))}
        >
          Explore →
        </button>
      )}
      {data.entries.length > 0 && <hr className='my-2 border-alt-gray' />}
      <div className='mt-1'>
        {data.entries.map((entry, i) => (
          <div key={i}>
            {entry.label && (
              <span className='font-semibold'>{entry.label}: </span>
            )}
            <span className='font-normal'>{entry.value}</span>
          </div>
        ))}
      </div>
    </>
  )
}
