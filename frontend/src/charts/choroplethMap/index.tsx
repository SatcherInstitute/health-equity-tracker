import { select } from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CAWP_METRICS } from '../../data/providers/CawpProvider'
import { PHRMA_METRICS } from '../../data/providers/PhrmaProvider'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { HetChartHoverTooltip } from '../HetChartHoverTooltip'
import { INVISIBLE_PRELOAD_WIDTH } from '../mapGlobals'
import { embedHighestLowestGroups, getCountyAddOn } from '../mapHelperFunctions'
import { useChartTooltip } from '../useChartTooltip'
import { HEIGHT_WIDTH_RATIO } from '../utils'
import { MapTooltipContent } from './MapTooltipContent'
import {
  createFeatures,
  createProjection,
  processPhrmaData,
} from './mapHelpers'
import { renderMap } from './renderMap'
import TerritoryCircles from './TerritoryCircles'
import type {
  ChoroplethMapProps,
  DataPoint,
  MapTooltipCallbacks,
  MapTooltipData,
} from './types'

const ChoroplethMap = ({
  data,
  metricConfig,
  highestLowestGroupsByFips,
  showCounties,
  fips,
  geoData,
  activeDemographicGroup,
  demographicType,
  countColsMap,
  isUnknownsMap = false,
  isMulti,
  isExtremesMode,
  mapConfig,
  signalListeners,
  filename,
  isPhrmaAdherence,
  isAtlantaMode,
  isSummaryLegend,
  updateFipsCallback,
  colorScale,
  allMissingDataIsSuppressed,
}: ChoroplethMapProps) => {
  const isMobile = !useIsBreakpointAndUp('md')
  const [ref, width] = useResponsiveWidth()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const isCoarsePointer =
    window.matchMedia?.('(pointer: coarse)').matches ?? false
  const mapInitializedRef = useRef(false)

  const {
    tooltipData: mapTooltipData,
    tooltipPos: mapTooltipPos,
    showTooltip,
    hideTooltip,
  } = useChartTooltip<MapTooltipData>()

  // State to store the dataMap created during map rendering
  const [renderResult, setRenderResult] = useState<{
    dataMap: Map<string, any>
    mapHeight: number
  } | null>(null)

  const isCawp = CAWP_METRICS.includes(metricConfig.metricId)
  const isPhrma = PHRMA_METRICS.includes(metricConfig.metricId)

  const suppressedData = useMemo(
    () => (isPhrma ? processPhrmaData(data, countColsMap) : data),
    [data, isPhrma, countColsMap],
  )

  const dataWithHighestLowest: DataPoint[] = useMemo(
    () =>
      !isUnknownsMap && !isMulti
        ? embedHighestLowestGroups(suppressedData, highestLowestGroupsByFips)
        : suppressedData,
    [suppressedData, highestLowestGroupsByFips, isUnknownsMap, isMulti],
  )

  const dimensions = useMemo(() => {
    const heightWidthRatio = HEIGHT_WIDTH_RATIO
    return {
      height: width * heightWidthRatio,
      ratio: heightWidthRatio,
    }
  }, [width])

  const tooltipCallbacks = useMemo<MapTooltipCallbacks>(
    () => ({ onShow: showTooltip, onHide: hideTooltip }),
    [showTooltip, hideTooltip],
  )

  // Hide tooltip on scroll/click/touchmove outside the map.
  // The click handler skips path/circle elements because touchstart already
  // shows the tooltip; a subsequent synthetic click on the same element
  // would otherwise immediately hide it.
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (
        svgRef.current &&
        !svgRef.current.contains(target) &&
        !target?.closest('[role="tooltip"]')
      ) {
        hideTooltip()
      }
    }
    window.addEventListener('wheel', hideTooltip)
    window.addEventListener('scroll', hideTooltip, { passive: true })
    window.addEventListener('click', handleOutsideClick)
    window.addEventListener('touchmove', hideTooltip)
    return () => {
      window.removeEventListener('wheel', hideTooltip)
      window.removeEventListener('scroll', hideTooltip)
      window.removeEventListener('click', handleOutsideClick)
      window.removeEventListener('touchmove', hideTooltip)
    }
  }, [hideTooltip])

  const cleanup = () => {
    hideTooltip()

    // Clean up SVG
    if (svgRef.current) {
      const svg = select(svgRef.current)
      svg.selectAll('*').remove()
      svg.on('.', null)
    }

    mapInitializedRef.current = false
    setRenderResult(null)
  }

  useEffect(() => {
    if (!data?.length || !svgRef.current || !width) {
      return
    }

    const initializeMap = async () => {
      if (mapInitializedRef.current) {
        return
      }

      const features = await createFeatures(
        showCounties,
        fips.code,
        geoData,
        isAtlantaMode,
      )

      const projection = createProjection(
        fips,
        width,
        dimensions.height,
        features,
      )

      const result = renderMap({
        svgRef,
        geoData: { features, projection },
        dataWithHighestLowest,
        metricConfig,
        width,
        height: isMulti ? dimensions.height + 100 : dimensions.height,
        tooltipCallbacks,
        showCounties,
        colorScale,
        fips,
        isMobile,
        activeDemographicGroup,
        demographicType,
        isCawp,
        countColsMap,
        isUnknownsMap,
        isExtremesMode,
        mapConfig,
        signalListeners,
        isMulti,
        isSummaryLegend,
        updateFipsCallback,
        allMissingDataIsSuppressed: allMissingDataIsSuppressed || false,
      })

      setRenderResult({
        dataMap: result.dataMap,
        mapHeight: result.mapHeight,
      })

      mapInitializedRef.current = true
    }

    cleanup()
    initializeMap().catch((error) => {
      console.error('Error initializing map:', error)
    })

    return cleanup
  }, [
    data,
    geoData,
    width,
    dimensions.height,
    showCounties,
    metricConfig,
    dataWithHighestLowest,
    mapConfig,
    fips,
    isMobile,
    activeDemographicGroup,
    demographicType,
    isCawp,
    countColsMap,
    isUnknownsMap,
    signalListeners,
    isExtremesMode,
    isSummaryLegend,
  ])

  return (
    <div
      className={`mx-2 justify-center ${width === INVISIBLE_PRELOAD_WIDTH ? 'hidden' : 'block'}`}
      ref={ref}
    >
      <svg
        ref={svgRef}
        style={{ width: '100%' }}
        aria-label={`Map showing ${filename}`}
      />

      {renderResult && fips.isUsa() && (
        <TerritoryCircles
          svgRef={svgRef}
          width={width}
          mapHeight={renderResult.mapHeight}
          fips={fips}
          dataWithHighestLowest={dataWithHighestLowest}
          colorScale={colorScale}
          metricConfig={metricConfig}
          dataMap={renderResult.dataMap}
          tooltipCallbacks={tooltipCallbacks}
          geographyType={getCountyAddOn(fips, showCounties)}
          isExtremesMode={isExtremesMode}
          mapConfig={mapConfig}
          signalListeners={signalListeners}
          isMobile={isMobile}
          isMulti={isMulti}
          isPhrmaAdherence={isPhrmaAdherence}
          isSummaryLegend={isSummaryLegend}
          updateFipsCallback={updateFipsCallback}
        />
      )}

      <HetChartHoverTooltip
        x={mapTooltipData && mapTooltipPos ? mapTooltipPos.x : null}
        y={mapTooltipData && mapTooltipPos ? mapTooltipPos.y : null}
        interactive={isCoarsePointer}
        inModal={isMulti}
      >
        {mapTooltipData && (
          <MapTooltipContent
            data={mapTooltipData}
            onExplore={updateFipsCallback}
            isTouch={isCoarsePointer}
          />
        )}
      </HetChartHoverTooltip>
    </div>
  )
}

export default ChoroplethMap
