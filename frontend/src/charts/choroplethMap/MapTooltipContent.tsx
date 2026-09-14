import { geoAzimuthalEqualArea, geoBounds, geoMercator, geoPath } from 'd3'
import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { Fips } from '../../data/utils/Fips'
import { colors } from '../../styles/tokens/colors'
import type { MapTooltipData } from './types'

interface MapTooltipContentProps {
  data: MapTooltipData
  onExplore: (fips: Fips) => void
  isTouch?: boolean
}

const MINI_MAX_W = 180
const MINI_MAX_H = 100
const MINI_PAD = 8

function MiniStateMap({
  feature,
  fillColor,
}: {
  feature: Feature<Geometry, GeoJsonProperties>
  fillColor?: string
}) {
  const [[x0, y0], [x1, y1]] = geoBounds(feature)
  const lonSpan = Math.max(x1 - x0, 0.01)
  const isAntimeridian = lonSpan > 180

  // Mercator vertical scale shrinks toward the poles; correct for center latitude.
  const centerLat = (y0 + y1) / 2
  const latScale = Math.cos((centerLat * Math.PI) / 180)
  const latSpan = Math.max((y1 - y0) / latScale, 0.01)

  // Antimeridian-crossing features (e.g. Alaska) get a square azimuthal projection
  // centered on the feature centroid — Mercator produces NaN scale for 340°+ spans.
  let svgW: number
  let svgH: number
  let proj:
    | ReturnType<typeof geoMercator>
    | ReturnType<typeof geoAzimuthalEqualArea>
  if (isAntimeridian) {
    svgW = MINI_MAX_W
    svgH = MINI_MAX_H
    // Rotate 180° so the antimeridian becomes the prime meridian — both halves
    // of the feature cluster near 0° in the rotated space, and fitSize works.
    proj = geoAzimuthalEqualArea()
      .rotate([180, 0])
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
  const showMiniMap = !isTouch && data.miniMapFeature != null

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
