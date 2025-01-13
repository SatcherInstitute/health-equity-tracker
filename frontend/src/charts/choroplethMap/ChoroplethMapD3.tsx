import { useEffect, useMemo, useRef } from 'react'
import { GEOGRAPHIES_DATASET_ID } from '../../data/config/MetadataMap'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import { PHRMA_METRICS } from '../../data/providers/PhrmaProvider'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { DATA_SUPPRESSED, INVISIBLE_PRELOAD_WIDTH } from '../mapGlobals'
import {
  embedHighestLowestGroups,
  getMapGroupLabel,
} from '../mapHelperFunctions'
import { HEIGHT_WIDTH_RATIO } from '../utils'
import { createTooltipContainer } from './tooltipUtils'
import type { ChoroplethMapProps, TooltipPairs } from './types'
import { renderMap, setupMap } from './utils'

const ChoroplethMapD3 = (props: ChoroplethMapProps) => {
  const {
    data,
    metric,
    countColsMap,
    isUnknownsMap,
    isMulti,
    highestLowestGroupsByFips,
    activeDemographicGroup,
    demographicType,
    geoData,
    showCounties,
    overrideShapeWithCircle,
  } = props

  const isMobile = !useIsBreakpointAndUp('md')
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [ref, width] = useResponsiveWidth()

  // Derived Metrics and Data
  const zeroData = data.filter((row) => row[metric.metricId] === 0)

  const suppressedData = useMemo(() => {
    if (PHRMA_METRICS.includes(metric.metricId)) {
      return data.map((row) => {
        const newRow = { ...row }
        const numeratorId = countColsMap?.numeratorConfig?.metricId
        const denominatorId = countColsMap?.denominatorConfig?.metricId

        if (numeratorId) {
          newRow[numeratorId] = row[numeratorId] ?? DATA_SUPPRESSED
        }
        if (denominatorId) {
          newRow[denominatorId] = row[denominatorId] ?? DATA_SUPPRESSED
        }
        return newRow
      })
    }
    return data
  }, [data, countColsMap, metric])

  const dataWithHighestLowest = useMemo(() => {
    if (!isUnknownsMap && !isMulti) {
      return embedHighestLowestGroups(suppressedData, highestLowestGroupsByFips)
    }
    return suppressedData
  }, [suppressedData, highestLowestGroupsByFips, isUnknownsMap, isMulti])

  // Tooltip Label
  const tooltipLabel = useMemo(() => {
    if (isUnknownsMap) return metric.unknownsVegaLabel || '% unknown'
    if (CAWP_METRICS.includes(metric.metricId)) {
      return `Rate — ${getWomenRaceLabel(activeDemographicGroup)}`
    }
    return getMapGroupLabel(
      demographicType,
      activeDemographicGroup,
      metric.type === 'index' ? 'Score' : 'Rate',
    )
  }, [activeDemographicGroup, demographicType, metric, isUnknownsMap])

  // Dimensions
  const heightWidthRatio = overrideShapeWithCircle
    ? HEIGHT_WIDTH_RATIO * 2
    : HEIGHT_WIDTH_RATIO
  const height = width * heightWidthRatio

  // Effects
  useEffect(() => {
    if (!data.length || !svgRef.current || !width) return

    // Create Tooltip Container
    const tooltipContainer = createTooltipContainer()

    // Define Tooltip Pairs
    const tooltipPairs: TooltipPairs = {
      [tooltipLabel]: (value) =>
        value !== undefined ? value.toString() : 'No data',
    }

    const mapSetup = async () => {
      try {
        const setup = await setupMap(
          geoData,
          showCounties,
          width,
          height,
          `/tmp/${GEOGRAPHIES_DATASET_ID}.json`,
        )

        if (!setup) return

        renderMap({
          svgRef,
          geoData: setup,
          data,
          metricId: metric.metricId,
          width,
          height,
          tooltipContainer,
          tooltipPairs,
          tooltipLabel,
          showCounties,
        })
      } catch (error) {
        console.error('Error rendering map:', error)
      }
    }

    mapSetup()

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
          height: '100%',
          minHeight: height,
        }}
      />
    </div>
  )
}

export default ChoroplethMapD3
