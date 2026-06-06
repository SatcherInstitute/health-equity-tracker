import { select } from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CAWP_METRICS } from '../../data/providers/CawpProvider'
import { PHRMA_METRICS } from '../../data/providers/PhrmaProvider'
import { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { HetChartHoverTooltip } from '../HetChartHoverTooltip'
import { INVISIBLE_PRELOAD_WIDTH } from '../mapGlobals'
import { embedHighestLowestGroups, getCountyAddOn } from '../mapHelperFunctions'
import { HEIGHT_WIDTH_RATIO } from '../utils'
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

interface MapTooltipContentProps {
  data: MapTooltipData
  onExplore: (fips: Fips) => void
}

function MapTooltipContent({ data, onExplore }: MapTooltipContentProps) {
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
  const mapInitializedRef = useRef(false)

  const [mapTooltipData, setMapTooltipData] = useState<MapTooltipData | null>(
    null,
  )
  const [mapTooltipPos, setMapTooltipPos] = useState<{
    x: number
    y: number
  } | null>(null)

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
    () => ({
      onShow: (data, x, y) => {
        setMapTooltipData(data)
        setMapTooltipPos({ x, y })
      },
      onHide: () => {
        setMapTooltipData(null)
        setMapTooltipPos(null)
      },
    }),
    [],
  )

  // Hide tooltip on scroll/click/touchmove outside the map
  useEffect(() => {
    const hide = () => {
      setMapTooltipData(null)
      setMapTooltipPos(null)
    }
    window.addEventListener('wheel', hide)
    window.addEventListener('click', hide)
    window.addEventListener('touchmove', hide)
    return () => {
      window.removeEventListener('wheel', hide)
      window.removeEventListener('click', hide)
      window.removeEventListener('touchmove', hide)
    }
  }, [])

  const cleanup = () => {
    setMapTooltipData(null)
    setMapTooltipPos(null)

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
        interactive={mapTooltipData?.eventType === 'touch'}
      >
        {mapTooltipData && (
          <MapTooltipContent
            data={mapTooltipData}
            onExplore={updateFipsCallback}
          />
        )}
      </HetChartHoverTooltip>
    </div>
  )
}

export default ChoroplethMap
