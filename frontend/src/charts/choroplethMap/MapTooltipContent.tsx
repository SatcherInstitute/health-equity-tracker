import { geoBounds, geoConicEqualArea, geoMercator, geoPath } from 'd3'
import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { Fips } from '../../data/utils/Fips'
import { colors } from '../../styles/tokens/colors'
import { GEO_HOVERED_BORDER_WIDTH, GEO_HOVERED_FILTER } from './mapUtils'
import type { MapTooltipData } from './types'

interface MapTooltipContentProps {
  data: MapTooltipData
  onExplore: (fips: Fips) => void
  isTouch?: boolean
}

const MINI_MAX_W = 180
const MINI_MAX_H = 100
const MINI_PAD = 8

// Show mini-maps for geographies too small to read on the national map.
// TERRITORY_CODES already covers DC + all island territories.
const SMALL_GEO_MINI_MAP_FIPS = new Set(Object.keys(TERRITORY_CODES))

function MiniStateMap({
  feature,
  fillColor,
  featureId,
}: {
  feature: Feature<Geometry, GeoJsonProperties>
  fillColor?: string
  featureId: string
}) {
  const [[x0, y0], [x1, y1]] = geoBounds(feature)
  const lonSpan = Math.max(x1 - x0, 0.01)

  // Mercator vertical scale shrinks toward the poles; correct for center latitude.
  const centerLat = (y0 + y1) / 2
  const latScale = Math.cos((centerLat * Math.PI) / 180)
  const latSpan = Math.max((y1 - y0) / latScale, 0.01)

  let svgW: number
  let svgH: number
  let proj:
    | ReturnType<typeof geoMercator>
    | ReturnType<typeof geoConicEqualArea>

  if (featureId === '02') {
    // Alaska crosses the antimeridian. geoMercator produces NaN; azimuthal
    // equal-area with rotate([180,0]) produces an empty bounding box.
    // Use the same conic equal-area sub-projection that geoAlbersUsa uses
    // internally for Alaska — it handles the antimeridian crossing correctly.
    svgW = MINI_MAX_W
    svgH = MINI_MAX_H
    proj = geoConicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65])
      .fitSize([svgW - MINI_PAD, svgH - MINI_PAD], feature)
  } else {
    const geoRatio = lonSpan / latSpan
    if (geoRatio >= 1) {
      svgW = MINI_MAX_W
      svgH = Math.max(Math.round(MINI_MAX_W / geoRatio), 32)
    } else {
      svgH = MINI_MAX_H
      svgW = Math.max(Math.round(MINI_MAX_H * geoRatio), 32)
    }
    proj = geoMercator().fitSize([svgW - MINI_PAD, svgH - MINI_PAD], feature)
  }

  const pathGen = geoPath(proj)
  const d = pathGen(feature) ?? ''
  if (!d) return null

  return (
    <svg
      width={svgW}
      height={svgH}
      className='mx-auto mt-2 block'
      aria-hidden='true'
    >
      <path
        d={d}
        transform={`translate(${MINI_PAD / 2}, ${MINI_PAD / 2})`}
        fill={fillColor ?? colors.altGreen}
        stroke={colors.altWhite}
        strokeWidth={GEO_HOVERED_BORDER_WIDTH}
        filter={GEO_HOVERED_FILTER}
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
    data.miniMapFeature != null && SMALL_GEO_MINI_MAP_FIPS.has(data.featureId)

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
      {showMiniMap && (
        <MiniStateMap
          feature={data.miniMapFeature!}
          fillColor={data.miniMapFillColor}
          featureId={data.featureId}
        />
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
