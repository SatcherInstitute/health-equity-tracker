import {
  geoArea,
  geoBounds,
  geoCentroid,
  geoConicEqualArea,
  geoDistance,
  geoMercator,
  geoPath,
} from 'd3'
import type {
  Feature,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from 'geojson'
import {
  ALASKA_FIPS,
  NORTHERN_MARIANA_ISLANDS_FIPS,
  TERRITORY_CODES,
} from '../../data/utils/ConstantsGeography'
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

// Show mini-maps for geographies too small to read on the national map.
// TERRITORY_CODES already covers DC + all island territories.
const SMALL_GEO_MINI_MAP_FIPS = new Set(Object.keys(TERRITORY_CODES))

// 3 degrees in radians — keeps nearby island clusters, drops distant outliers.
const PROXIMITY_THRESHOLD = 3 * (Math.PI / 180)

// For sparse archipelagos, trim to a tight cluster suitable for a single
// projection. MP (FIPS 69) is a special case: its top 3 islands by area are
// Saipan/Tinian/Rota (all close together), but the proximity filter retains
// 5 of 6 polygons spanning 4+ degrees, collapsing the SVG to ~32px wide.
// All other territories already have tight enough bounding boxes via proximity.
function clusterAroundLargest(
  feature: Feature<Geometry, GeoJsonProperties>,
  featureId: string,
): Feature<Geometry, GeoJsonProperties> {
  if (feature.geometry?.type !== 'MultiPolygon') return feature

  const make = (
    coords: Polygon['coordinates'],
  ): Feature<Polygon, GeoJsonProperties> => ({
    type: 'Feature',
    properties: feature.properties,
    geometry: { type: 'Polygon', coordinates: coords },
  })

  const polys = (feature.geometry as MultiPolygon).coordinates.map(make)
  polys.sort((a, b) => geoArea(b) - geoArea(a))

  let kept: typeof polys
  if (featureId === NORTHERN_MARIANA_ISLANDS_FIPS) {
    kept = polys.slice(0, 3)
  } else {
    const anchorCentroid = geoCentroid(polys[0])
    kept = polys.filter(
      (p) => geoDistance(anchorCentroid, geoCentroid(p)) <= PROXIMITY_THRESHOLD,
    )
  }

  if (kept.length === 1) return kept[0]
  return {
    ...feature,
    geometry: {
      type: 'MultiPolygon',
      coordinates: kept.map((p) => (p.geometry as Polygon).coordinates),
    },
  }
}

function MiniStateMap({
  feature,
  fillColor,
  featureId,
}: {
  feature: Feature<Geometry, GeoJsonProperties>
  fillColor?: string
  featureId: string
}) {
  // Alaska: fixed conic projection that handles antimeridian crossing.
  if (featureId === ALASKA_FIPS) {
    const proj = geoConicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65])
      .fitSize([MINI_MAX_W - MINI_PAD, MINI_MAX_H - MINI_PAD], feature)
    const d = geoPath(proj)(feature) ?? ''
    if (!d) return null
    return (
      <svg
        width={MINI_MAX_W}
        height={MINI_MAX_H}
        className='mx-auto mt-2 block'
        aria-hidden='true'
      >
        <path
          d={d}
          transform={`translate(${MINI_PAD / 2},${MINI_PAD / 2})`}
          fill={fillColor ?? colors.altGreen}
          stroke={colors.altDark}
          strokeWidth={1}
        />
      </svg>
    )
  }

  const displayFeature = clusterAroundLargest(feature, featureId)
  const [[x0, y0], [x1, y1]] = geoBounds(displayFeature)
  const lonSpan = Math.max(x1 - x0, 0.01)
  const latScale = Math.cos(((y0 + y1) / 2) * (Math.PI / 180))
  const latSpan = Math.max((y1 - y0) / latScale, 0.01)
  const geoRatio = lonSpan / latSpan
  const svgW =
    geoRatio >= 1 ? MINI_MAX_W : Math.max(Math.round(MINI_MAX_H * geoRatio), 32)
  const svgH =
    geoRatio >= 1 ? Math.max(Math.round(MINI_MAX_W / geoRatio), 32) : MINI_MAX_H
  const proj = geoMercator().fitSize(
    [svgW - MINI_PAD, svgH - MINI_PAD],
    displayFeature,
  )
  const d = geoPath(proj)(displayFeature) ?? ''
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
        transform={`translate(${MINI_PAD / 2},${MINI_PAD / 2})`}
        fill={fillColor ?? colors.altGreen}
        stroke={colors.altDark}
        strokeWidth={1}
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
