import { geoMercator, geoPath } from 'd3'
import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { Fips } from '../../data/utils/Fips'
import { colors } from '../../styles/tokens/colors'
import { SMALL_STATE_FIPS } from './mapUtils'
import type { MapTooltipData } from './types'

interface MapTooltipContentProps {
  data: MapTooltipData
  onExplore: (fips: Fips) => void
  isTouch?: boolean
}

const MINI_SIZE = 72

function MiniStateMap({
  feature,
}: {
  feature: Feature<Geometry, GeoJsonProperties>
}) {
  const inner = MINI_SIZE - 8
  const proj = geoMercator().fitSize([inner, inner], feature)
  const pathGen = geoPath(proj)
  const d = pathGen(feature) ?? ''
  return (
    <svg
      width={MINI_SIZE}
      height={MINI_SIZE}
      className='mx-auto mt-2 block'
      aria-hidden='true'
    >
      <path
        d={d}
        transform='translate(4, 4)'
        fill={colors.altGreen}
        stroke={colors.altBlack}
        strokeWidth={0.5}
      />
    </svg>
  )
}

export function MapTooltipContent({
  data,
  onExplore,
  isTouch = false,
}: MapTooltipContentProps) {
  const showMiniMap =
    !isTouch &&
    data.miniMapFeature != null &&
    SMALL_STATE_FIPS.has(data.featureId)

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
      {showMiniMap && <MiniStateMap feature={data.miniMapFeature!} />}
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
