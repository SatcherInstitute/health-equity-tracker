import * as d3 from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CAWP_METRICS } from '../../data/providers/CawpProvider'
import { PHRMA_METRICS } from '../../data/providers/PhrmaProvider'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { INVISIBLE_PRELOAD_WIDTH } from '../mapGlobals'
import { embedHighestLowestGroups, getCountyAddOn } from '../mapHelperFunctions'
import { HEIGHT_WIDTH_RATIO } from '../utils'
import TerritoryCircles from './TerritoryCircles'
import { createColorScale } from './colorSchemes'
import {
  createFeatures,
  createProjection,
  processPhrmaData,
} from './mapHelpers'
import { renderMap } from './renderMap'
import { createTooltipContainer } from './tooltipUtils'
import type { ChoroplethMapProps, DataPoint } from './types'

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
  extremesMode,
  mapConfig,
  signalListeners,
  filename,
  legendData,
  isPhrmaAdherence,
  isAtlantaMode,
  isSummaryLegend,
  updateFipsCallback,
}: ChoroplethMapProps) => {
  const isMobile = !useIsBreakpointAndUp('md')
  const [ref, width] = useResponsiveWidth()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const tooltipContainerRef = useRef<ReturnType<
    typeof createTooltipContainer
  > | null>(null)
  const mapInitializedRef = useRef(false)
  const eventCleanupRef = useRef<(() => void) | null>(null)

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

  const cleanup = () => {
    // Clean up event listeners if they exist
    if (eventCleanupRef.current) {
      eventCleanupRef.current()
      eventCleanupRef.current = null
    }

    // Clean up tooltip
    if (tooltipContainerRef.current) {
      tooltipContainerRef.current.remove()
      tooltipContainerRef.current = null
    }

    // Clean up SVG
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
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

      tooltipContainerRef.current ??= createTooltipContainer(isMulti)

      const colorScale = createColorScale({
        data: legendData || dataWithHighestLowest,
        metricId: metricConfig.metricId,
        colorScheme: mapConfig.scheme,
        isUnknown: isUnknownsMap,
        fips,
        reverse: !mapConfig.higherIsBetter && !isUnknownsMap,
        isPhrmaAdherence,
        mapConfig,
      })

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
        tooltipContainer: tooltipContainerRef.current!,
        showCounties,
        colorScale,
        fips,
        isMobile,
        activeDemographicGroup,
        demographicType,
        isCawp,
        countColsMap,
        isUnknownsMap,
        extremesMode,
        mapConfig,
        signalListeners,
        isMulti,
        isSummaryLegend,
        updateFipsCallback,
      })

      // Store the event cleanup function
      if (result.cleanupEventListeners) {
        eventCleanupRef.current = result.cleanupEventListeners
      }

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
    extremesMode,
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
          colorScale={createColorScale({
            data: legendData || dataWithHighestLowest,
            metricId: metricConfig.metricId,
            colorScheme: mapConfig.scheme,
            isUnknown: isUnknownsMap,
            fips,
            reverse: !mapConfig.higherIsBetter && !isUnknownsMap,
            isPhrmaAdherence,
            mapConfig,
          })}
          metricConfig={metricConfig}
          dataMap={renderResult.dataMap}
          tooltipContainer={tooltipContainerRef.current}
          geographyType={getCountyAddOn(fips, showCounties)}
          extremesMode={extremesMode}
          mapConfig={mapConfig}
          signalListeners={signalListeners}
          isMobile={isMobile}
          isMulti={isMulti}
          isPhrmaAdherence={isPhrmaAdherence}
          isSummaryLegend={isSummaryLegend}
        />
      )}
    </div>
  )
}

export default ChoroplethMap
