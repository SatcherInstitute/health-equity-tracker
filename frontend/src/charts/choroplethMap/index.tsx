import { useEffect, useMemo, useRef } from 'react'
import { scaleType } from 'vega-lite/build/src/compile/scale/type'
import { CAWP_METRICS } from '../../data/providers/CawpProvider'
import { PHRMA_METRICS } from '../../data/providers/PhrmaProvider'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { INVISIBLE_PRELOAD_WIDTH } from '../mapGlobals'
import { embedHighestLowestGroups } from '../mapHelperFunctions'
import { HEIGHT_WIDTH_RATIO } from '../utils'
import {
  createColorScale,
  createFeatures,
  createProjection,
  processPhrmaData,
} from './mapHelpers'
import { renderMap } from './renderMap'
import { createTooltipContainer } from './tooltipUtils'
import type { ChoroplethMapProps, DataPoint } from './types'

const ChoroplethMap = (props: ChoroplethMapProps) => {
  const { data, metric, highestLowestGroupsByFips } = props
  const isMobile = !useIsBreakpointAndUp('md')
  const [ref, width] = useResponsiveWidth()
  const svgRef = useRef<SVGSVGElement | null>(null)

  const tooltipContainerRef = useRef<ReturnType<
    typeof createTooltipContainer
  > | null>(null)

  const isCawp = CAWP_METRICS.includes(metric.metricId)
  const isPhrma = PHRMA_METRICS.includes(metric.metricId)

  const suppressedData = useMemo(
    () => (isPhrma ? processPhrmaData(data, props.countColsMap) : data),
    [data, isPhrma, props.countColsMap],
  )

  const dataWithHighestLowest: DataPoint[] = useMemo(
    () =>
      !props.isUnknownsMap && !props.isMulti
        ? embedHighestLowestGroups(suppressedData, highestLowestGroupsByFips)
        : suppressedData,
    [
      suppressedData,
      highestLowestGroupsByFips,
      props.isUnknownsMap,
      props.isMulti,
    ],
  )

  const heightWidthRatio = props.overrideShapeWithCircle
    ? HEIGHT_WIDTH_RATIO * 2
    : HEIGHT_WIDTH_RATIO
  const height = width * heightWidthRatio

  useEffect(() => {
    if (!data.length || !svgRef.current || !width) return

    if (!tooltipContainerRef.current) {
      tooltipContainerRef.current = createTooltipContainer()
    }

    const initializeMap = async () => {
      const colorScale = createColorScale({
        data,
        metricId: metric.metricId,
        colorScheme: props.mapConfig.scheme,
        isUnknown: props.isUnknownsMap,
        fips: props.fips,
      })

      const features = await createFeatures(
        props.showCounties,
        props.fips.code,
        props.geoData,
      )

      const projection = createProjection(props.fips, width, height, features)

      renderMap({
        svgRef,
        geoData: { features, projection },
        dataWithHighestLowest,
        metric,
        width,
        height,
        tooltipContainer: tooltipContainerRef.current!,
        showCounties: props.showCounties,
        updateFipsCallback: props.updateFipsCallback,
        mapConfig: props.mapConfig,
        colorScale,
        fips: props.fips,
        isMobile,
        activeDemographicGroup: props.activeDemographicGroup,
        demographicType: props.demographicType,
        isCawp,
        countColsMap: props.countColsMap,
        isUnknownsMap: props.isUnknownsMap,
      })
    }

    initializeMap()

    return () => {
      if (tooltipContainerRef.current) {
        tooltipContainerRef.current.remove()
        tooltipContainerRef.current = null
      }
    }
  }, [
    data,
    props.geoData,
    width,
    height,
    props.showCounties,
    props.overrideShapeWithCircle,
    metric,
    dataWithHighestLowest,
    props.updateFipsCallback,
    props.mapConfig,
    props.fips,
    isMobile,
    props.activeDemographicGroup,
    props.demographicType,
    isCawp,
    props.countColsMap,
    props.isUnknownsMap,
    scaleType,
  ])

  return (
    <div
      className={`justify-center ${width === INVISIBLE_PRELOAD_WIDTH ? 'hidden' : 'block'}`}
      ref={props.overrideShapeWithCircle ? undefined : ref}
    >
      <svg ref={svgRef} style={{ width: '100%' }} />
    </div>
  )
}

export default ChoroplethMap
