import { geoPath, select } from 'd3'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { DATA_SUPPRESSED, NO_DATA_MESSAGE } from '../mapGlobals'
import { getCountyAddOn } from '../mapHelperFunctions'
import { getFillColor, getStrokeColor } from './colorSchemes'
import {
  createDataMap,
  formatMetricValue,
  getDenominatorPhrase,
  getNumeratorPhrase,
  getTooltipLabel,
} from './mapHelpers'
import { TERRITORIES } from './mapTerritoryHelpers'
import { GHOST_STROKE_WIDTH, INSET_STATE_FIPS, STROKE_WIDTH } from './mapUtils'
import {
  createEventHandler,
  createMouseEventOptions,
} from './mouseEventHandlers'
import type {
  ColorScale,
  InitializeSvgOptions,
  RenderMapOptions,
} from './types'

const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }
// Extra downward nudge of the map group on mobile; must also be subtracted
// from the projection fit height or the bottom of the map clips off the SVG
const MOBILE_TOP_OFFSET = 10

// Pre-compute which arc indices appear in exactly one geometry (coastlines).
// Shared arcs (borders between two geographies) appear twice and are excluded
// so ghost strokes never bleed across state/county lines.
// cSpell:ignore topoObj topoKey
function buildCoastalArcSet(topoObj: any): Set<number> {
  const count = new Map<number, number>()
  for (const geom of topoObj.geometries ?? []) {
    if (!geom.arcs) continue
    const rings: number[][] =
      geom.type === 'MultiPolygon' ? geom.arcs.flat(1) : geom.arcs
    for (const ring of rings) {
      for (const rawIdx of ring) {
        const canon = rawIdx < 0 ? ~rawIdx : rawIdx
        count.set(canon, (count.get(canon) ?? 0) + 1)
      }
    }
  }
  const coastal = new Set<number>()
  for (const [idx, c] of count) {
    if (c === 1) coastal.add(idx)
  }
  return coastal
}

// Build an SVG path string from only the coastal arcs of one topology geometry.
// Arcs are delta-decoded to lat/lng via the topology transform, then projected.
function buildCoastalPathD(
  topology: any,
  geom: any,
  coastalArcs: Set<number>,
  pathGen: ReturnType<typeof geoPath>,
): string {
  const { scale = [1, 1], translate = [0, 0] } = topology.transform ?? {}
  const rings: number[][] =
    geom.type === 'MultiPolygon' ? geom.arcs.flat(1) : (geom.arcs ?? [])

  let d = ''
  for (const ring of rings) {
    for (const rawIdx of ring) {
      const canon = rawIdx < 0 ? ~rawIdx : rawIdx
      if (!coastalArcs.has(canon)) continue

      // Delta-decode quantized arc → lat/lng coordinates
      let x = 0
      let y = 0
      const coords: [number, number][] = topology.arcs[canon].map(
        ([dx, dy]: [number, number]) => {
          x += dx
          y += dy
          return [x * scale[0] + translate[0], y * scale[1] + translate[1]] as [
            number,
            number,
          ]
        },
      )
      if (rawIdx < 0) coords.reverse()
      if (coords.length < 2) continue

      const segment = pathGen({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: null,
      })
      if (segment) d += segment
    }
  }
  return d
}

export const renderMap = (options: RenderMapOptions) => {
  const {
    svgRef,
    width,
    height,
    fips,
    isMobile,
    isUnknownsMap,
    geoData,
    isCawp,
    countColsMap,
    demographicType,
    activeDemographicGroup,
    dataWithHighestLowest,
    metricConfig,
    showCounties,
    signalListeners,
    isMulti,
    mapConfig,
    isExtremesMode,
    colorScale,
    topology,
  } = options

  select(svgRef.current).selectAll('*').remove()

  const territoryHeight = fips.isUsa()
    ? TERRITORIES.marginTop + TERRITORIES.radius * 2
    : 0
  const mapHeight =
    height - territoryHeight - (isMobile ? MOBILE_TOP_OFFSET : 0)

  const { mapGroup } = initializeSvg({
    svgRef: svgRef,
    width: width,
    height: height,
    isMobile: isMobile,
    isUnknownsMap: isUnknownsMap,
  })

  const { features, projection } = geoData
  const geographyType = getCountyAddOn(fips, showCounties)

  projection.fitSize([width, mapHeight], features)
  const path = geoPath(projection)

  const tooltipLabel = getTooltipLabel(
    isUnknownsMap,
    metricConfig,
    activeDemographicGroup,
    demographicType,
  )
  const numeratorPhrase = getNumeratorPhrase(
    isCawp,
    countColsMap,
    demographicType,
    activeDemographicGroup,
  )
  const denominatorPhrase = getDenominatorPhrase(
    isCawp,
    countColsMap,
    demographicType,
    activeDemographicGroup,
  )

  const dataMap = createDataMap(
    dataWithHighestLowest,
    tooltipLabel,
    metricConfig,
    numeratorPhrase,
    denominatorPhrase,
    countColsMap,
  )

  const mouseEventOptions = createMouseEventOptions(
    options,
    dataMap,
    geographyType,
    demographicType,
  )

  // Extremes mode draws only the highest and lowest geographies; the rest are
  // background context carrying no value. Announcing each one would make a
  // screen reader user walk thousands of counties to reach the handful that
  // hold the answer, so they leave the accessibility tree entirely.
  const isExtremesContext = (d: any) =>
    isExtremesMode && dataMap.get(d.id?.toString())?.value == null

  // Draw main map
  // Render suppressed counties last so their dark strokes appear on top at shared edges
  const filteredFeatures = features.features.filter(
    (f) => f.id && (!fips.isUsa() || !TERRITORY_CODES[f.id.toString()]),
  )
  const sortedFeatures = filteredFeatures.toSorted((a, b) => {
    const aIsSuppressed = dataMap.get(String(a.id))?.isSuppressed || false
    const bIsSuppressed = dataMap.get(String(b.id))?.isSuppressed || false
    // Non-suppressed first, suppressed last
    return aIsSuppressed === bIsSuppressed ? 0 : aIsSuppressed ? 1 : -1
  })

  const ariaLabel = (d: any) => {
    if (isExtremesContext(d)) return null
    const id = d.id?.toString()
    const name = d.properties?.name ?? id ?? 'Unknown'
    const namePlace = geographyType ? `${name} ${geographyType}` : name
    const mapData = dataMap.get(id)
    if (!mapData || mapData.value == null) {
      return `${namePlace}: ${
        mapData?.isSuppressed ? DATA_SUPPRESSED : NO_DATA_MESSAGE
      }`
    }
    const formattedValue = formatMetricValue(
      mapData.value as number,
      metricConfig,
    )
    const label = tooltipLabel
      ? `${tooltipLabel} ${formattedValue}`
      : formattedValue
    return `${namePlace}: ${label}`
  }

  // Visible paths carry choropleth colors and accessible labels.
  // class="visible-path" lets coastline ghost paths target them via getVisualTarget.
  mapGroup
    .selectAll('path.visible-path')
    .data(sortedFeatures)
    .join('path')
    .attr('class', 'visible-path')
    .attr('d', (d) => path(d) || '')
    .attr('data-fips', (d: any) => String(d.id ?? ''))
    .attr('fill', (d) =>
      getFillColor({
        d,
        dataMap,
        colorScale: colorScale as ColorScale,
        isExtremesMode: isExtremesMode,
        mapConfig: mapConfig,
        isMultiMap: isMulti,
      }),
    )
    .attr('stroke', (d) =>
      getStrokeColor({
        d,
        dataMap,
        colorScale: colorScale as ColorScale,
        isExtremesMode: isExtremesMode,
        mapConfig: mapConfig,
        isMultiMap: isMulti,
      }),
    )
    .attr('stroke-width', STROKE_WIDTH)
    .attr('aria-hidden', (d: any) => (isExtremesContext(d) ? 'true' : null))
    .attr('role', (d: any) => (isExtremesContext(d) ? null : 'img'))
    .attr('tabindex', '-1')
    .attr('aria-label', ariaLabel)
    .on('mouseover', (event: any, d) => {
      createEventHandler('mouseover', mouseEventOptions)(event, d)
    })
    .on('mouseout', (event: any, d) => {
      createEventHandler('mouseout', mouseEventOptions)(event, d)
    })
    .on(
      'touchstart',
      (event: any, d) => {
        createEventHandler('touchstart', mouseEventOptions)(event, d)
      },
      { passive: true },
    )
    .on('touchend', (event: any, d) => {
      createEventHandler('touchend', mouseEventOptions)(event, d)
    })
    .on('pointerup', (event: any, d) => {
      if (
        event.pointerType === 'mouse' &&
        typeof signalListeners.click === 'function'
      ) {
        signalListeners.click(event, d)
      }
    })

  // Coastline ghost paths — transparent thick stroke on non-shared arc edges
  // only (coastlines, not inland borders). Extends the pointer hit area into
  // coastal water without overlapping adjacent geographies' hit areas.
  // getVisualTarget redirects visual effects to the underlying visible-path.
  if (topology && sortedFeatures.length > 1) {
    const topoKey = showCounties ? 'counties' : 'states'
    const topoObj = topology.objects?.[topoKey]

    if (topoObj?.geometries?.length > 1) {
      const coastalArcs = buildCoastalArcSet(topoObj)

      // Build a fast lookup from id -> topology geometry for path construction
      const geomById = new Map<string, any>()
      for (const geom of topoObj.geometries) {
        geomById.set(String(geom.id ?? ''), geom)
      }

      const coastMouseEventOptions = createMouseEventOptions(
        {
          ...options,
          getVisualTarget: (_event: any, d: any) =>
            svgRef.current?.querySelector(
              `path.visible-path[data-fips="${String(d.id ?? '')}"]`,
            ) ?? null,
        },
        dataMap,
        geographyType,
        demographicType,
      )

      mapGroup
        .selectAll('path.coast-ghost')
        .data(sortedFeatures)
        .join('path')
        .attr('class', 'coast-ghost')
        .attr('data-fips', (d: any) => String(d.id ?? ''))
        .attr('d', (d: any) => {
          const geom = geomById.get(String(d.id ?? ''))
          if (!geom) return ''
          return buildCoastalPathD(topology, geom, coastalArcs, path)
        })
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', GHOST_STROKE_WIDTH)
        .attr('pointer-events', 'stroke')
        .attr('aria-hidden', 'true')
        .on('mouseover', (event: any, d) => {
          createEventHandler('mouseover', coastMouseEventOptions)(event, d)
        })
        .on('mouseout', (event: any, d) => {
          createEventHandler('mouseout', coastMouseEventOptions)(event, d)
        })
        .on(
          'touchstart',
          (event: any, d) => {
            createEventHandler('touchstart', coastMouseEventOptions)(event, d)
          },
          { passive: true },
        )
        .on('touchend', (event: any, d) => {
          createEventHandler('touchend', coastMouseEventOptions)(event, d)
        })
        .on('pointerup', (event: any, d) => {
          if (
            event.pointerType === 'mouse' &&
            typeof signalListeners.click === 'function'
          ) {
            signalListeners.click(event, d)
          }
        })
    }
  }

  // AK and HI render as geographic insets; their land pixels are tiny and
  // water fills the inset area. A transparent bounding-box rect makes the
  // entire inset (water + land) clickable and hoverable.
  if (fips.isUsa()) {
    const insetFeatures = filteredFeatures.filter((f) =>
      INSET_STATE_FIPS.has(String(f.id ?? '')),
    )

    const rectMouseEventOptions = createMouseEventOptions(
      {
        ...options,
        getVisualTarget: (_event: any, d: any) =>
          svgRef.current?.querySelector(
            `path.visible-path[data-fips="${String(d.id ?? '')}"]`,
          ) ?? null,
      },
      dataMap,
      geographyType,
      demographicType,
    )

    mapGroup
      .selectAll('rect.inset-hit-rect')
      .data(insetFeatures)
      .join('rect')
      .attr('class', 'inset-hit-rect')
      .attr('data-fips', (d: any) => String(d.id ?? ''))
      .attr('role', 'img')
      .attr('tabindex', '-1')
      .attr('aria-label', ariaLabel)
      .each(function (d) {
        const bounds = path.bounds(d)
        const x = bounds[0][0]
        const y = bounds[0][1]
        const w = bounds[1][0] - bounds[0][0]
        const h = bounds[1][1] - bounds[0][1]
        select(this)
          .attr('x', x)
          .attr('y', y)
          .attr('width', w)
          .attr('height', h)
      })
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', (event: any, d) => {
        createEventHandler('mouseover', rectMouseEventOptions)(event, d)
      })
      .on('mouseout', (event: any, d) => {
        createEventHandler('mouseout', rectMouseEventOptions)(event, d)
      })
      .on(
        'touchstart',
        (event: any, d) => {
          createEventHandler('touchstart', rectMouseEventOptions)(event, d)
        },
        { passive: true },
      )
      .on('touchend', (event: any, d) => {
        createEventHandler('touchend', rectMouseEventOptions)(event, d)
      })
      .on('pointerup', (event: any, d) => {
        if (
          event.pointerType === 'mouse' &&
          typeof signalListeners.click === 'function'
        ) {
          signalListeners.click(event, d)
        }
      })
  }

  return {
    dataMap,
    mapHeight,
  }
}

const initializeSvg = (options: InitializeSvgOptions) => {
  const { svgRef, width, height, isMobile } = options
  const { left, top } = MARGIN

  const svg = select(svgRef.current).attr('width', width).attr('height', height)

  return {
    mapGroup: svg
      .append('g')
      .attr('class', 'map-container')
      .attr(
        'transform',
        `translate(${left}, ${isMobile ? top + MOBILE_TOP_OFFSET : top})`,
      ),
  }
}
