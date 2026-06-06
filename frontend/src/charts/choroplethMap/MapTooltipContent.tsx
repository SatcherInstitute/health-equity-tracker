import { Fips } from '../../data/utils/Fips'
import type { MapTooltipData } from './types'

interface MapTooltipContentProps {
  data: MapTooltipData
  onExplore: (fips: Fips) => void
}

export function MapTooltipContent({ data, onExplore }: MapTooltipContentProps) {
  return (
    <>
      <div className='font-semibold'>
        {data.name} {data.geographyType}
      </div>
      {!data.isSummaryLegend && data.eventType === 'touch' && (
        <button
          type='button'
          className='mt-1 cursor-pointer border-0 bg-transparent p-0 text-left text-alt-green underline'
          onClick={() => onExplore(new Fips(data.featureId))}
        >
          Explore {data.name} {data.geographyType} →
        </button>
      )}
      {!data.isSummaryLegend && data.eventType === 'mouse' && (
        <div className='mt-1 font-normal text-alt-gray'>Click to explore</div>
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
