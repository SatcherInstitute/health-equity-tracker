import { useEffect, useRef } from 'react'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { INVISIBLE_PRELOAD_WIDTH } from '../mapGlobals'
import { HEIGHT_WIDTH_RATIO } from '../utils'
import {
  createColorScale,
  createFeatures,
  createProjection,
} from './mapHelpers'
import { renderMap } from './renderMap'
import {
  createTooltipContainer,
  createTooltipLabel,
  getTooltipPairs,
} from './tooltipUtils'
import type { ChoroplethMapProps } from './types'

const ChoroplethMap = (props: ChoroplethMapProps) => {
  const {
    data,
    metric,
    isUnknownsMap,
    activeDemographicGroup,
    demographicType,
    fips,
    geoData,
    showCounties,
    overrideShapeWithCircle,
    updateFipsCallback,
    mapConfig,
  } = props
  const [ref, width] = useResponsiveWidth()
  const svgRef = useRef<SVGSVGElement | null>(null)

  const heightWidthRatio = overrideShapeWithCircle
    ? HEIGHT_WIDTH_RATIO * 2
    : HEIGHT_WIDTH_RATIO

  const height = width * heightWidthRatio

  const tooltipContainer = createTooltipContainer()

  useEffect(() => {
    if (!data.length || !svgRef.current || !width) return

    const initializeMap = async () => {
      const colorScale = createColorScale({
        data,
        metricId: metric.metricId,
        scaleType: 'sequentialSymlog',
        colorScheme: mapConfig.scheme,
      })

      const features = await createFeatures({
        showCounties,
        parentFips: fips.code,
        geoData,
      })

      const projection = createProjection({ fips, width, height, features })

      const tooltipLabel = createTooltipLabel(
        metric,
        activeDemographicGroup,
        demographicType,
        isUnknownsMap,
      )

      const tooltipPairs = getTooltipPairs(tooltipLabel)

      renderMap({
        svgRef,
        geoData: { features, projection },
        data,
        metric,
        width,
        height,
        tooltipContainer,
        tooltipPairs,
        tooltipLabel,
        showCounties,
        updateFipsCallback,
        mapConfig,
        colorScale,
        fips,
      })
    }
    initializeMap()
    return () => {
      tooltipContainer.remove()
    }
  }, [
    data,
    geoData,
    width,
    height,
    showCounties,
    overrideShapeWithCircle,
    metric,
  ])

  return (
    <div
      className={`justify-center ${
        width === INVISIBLE_PRELOAD_WIDTH ? 'hidden' : 'block'
      }`}
      ref={overrideShapeWithCircle ? undefined : ref}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
        }}
      />
    </div>
  )
}

export default ChoroplethMap
