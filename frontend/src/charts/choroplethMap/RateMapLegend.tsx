import type * as d3 from 'd3'
import { useEffect, useState } from 'react'
import { INVISIBLE_PRELOAD_WIDTH } from '../../charts/mapGlobals'
import type {
  DataTypeConfig,
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import type { GeographicBreakdown } from '../../data/query/Breakdowns'
import type { FieldRange } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import ClickableLegendHeader from '../ClickableLegendHeader'
import { NO_DATA_MESSAGE, PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import LegendItem from './LegendItem'
import { createColorScale } from './colorSchemes'
import { useGetLegendColumnCount } from './mapLegendUtils'
import { formatMetricValue } from './tooltipUtils'

interface RateMapLegendProps {
  dataTypeConfig: DataTypeConfig
  data?: Array<Record<string, any>> // Dataset for which to calculate legend
  metricConfig: MetricConfig
  fieldRange?: FieldRange // May be used if standardizing legends across charts
  description: string
  fipsTypeDisplayName?: GeographicBreakdown
  mapConfig: MapConfig
  isPhrmaAdherence: boolean
  isSummaryLegend?: boolean
  fips: Fips
  isMulti?: boolean
  legendTitle: string
}

interface LegendItemData {
  color: string
  label: string
  value: any
}

export default function RateMapLegend(props: RateMapLegendProps) {
  function labelFormat(value: number) {
    return formatMetricValue(value, props.metricConfig, true)
  }

  // Get dynamic column count based on screen size
  const [containerRef, containerWidth] = useResponsiveWidth()
  const regularColsCount = useGetLegendColumnCount(containerWidth)
  const [legendItems, setLegendItems] = useState<{
    regular: LegendItemData[]
    special: LegendItemData[]
  }>({ regular: [], special: [] })

  // Process data and create legend items
  useEffect(() => {
    if (!props.data || containerWidth === INVISIBLE_PRELOAD_WIDTH) {
      return
    }

    // Process data - separate zero, non-zero, and missing data
    const zeroData = props.data.filter(
      (row) => row[props.metricConfig.metricId] === 0,
    )
    const nonZeroData = props.data.filter(
      (row) => row[props.metricConfig.metricId] > 0,
    )
    const uniqueNonZeroValues = Array.from(
      new Set(nonZeroData.map((row) => row[props.metricConfig.metricId])),
    ).sort((a, b) => a - b)
    const missingData = props.data.filter(
      (row) => row[props.metricConfig.metricId] == null,
    )

    const hasMissingData = missingData.length > 0
    const hasZeroData = zeroData.length > 0

    // Separate regular legend items from special items
    const regularLegendItems: LegendItemData[] = []
    const specialLegendItems: LegendItemData[] = []

    if (uniqueNonZeroValues.length > 0 && !props.isSummaryLegend) {
      const colorScale = createColorScale({
        data: props.data,
        metricId: props.metricConfig.metricId,
        colorScheme: props.mapConfig.scheme,
        isUnknown: false,
        fips: props.fips,
        reverse: !props.mapConfig.higherIsBetter,
        isPhrmaAdherence: props.isPhrmaAdherence,
        isSummaryLegend: props.isSummaryLegend,
        mapConfig: props.mapConfig,
      }) as d3.ScaleQuantile<string, number>

      const thresholds = props.isPhrmaAdherence
        ? PHRMA_ADHERENCE_BREAKPOINTS
        : colorScale.quantiles()
      if (thresholds.length > 0) {
        const firstThreshold = thresholds[0]
        const lastThreshold = thresholds[thresholds.length - 1]

        regularLegendItems.push(
          {
            value: firstThreshold - 1,
            label: `< ${labelFormat(firstThreshold)}`,
            color: colorScale(firstThreshold - 1) as string,
          },
          ...thresholds.slice(0, -1).map((threshold, i) => ({
            value: threshold,
            label: `${labelFormat(threshold)} – ${labelFormat(thresholds[i + 1])}`,
            color: colorScale(threshold) as string,
          })),
          {
            value: lastThreshold,
            label: `≥ ${labelFormat(lastThreshold)}`,
            color: colorScale(lastThreshold) as string,
          },
        )
      }
    }

    if (props.isSummaryLegend) {
      const summaryValue = nonZeroData[0][props.metricConfig.metricId]
      regularLegendItems.push({
        value: summaryValue,
        label: `${labelFormat(summaryValue)} (${props.fipsTypeDisplayName} overall)`,
        color: props.mapConfig.mid,
      })
    }

    // Items with value of 0
    if (hasZeroData) {
      specialLegendItems.push({
        color: props.mapConfig.zero || het.mapLightest,
        label: labelFormat(0),
        value: 0,
      })
    }

    // Add missing data item to special items
    if (hasMissingData) {
      specialLegendItems.push({
        color: het.howToColor,
        label: NO_DATA_MESSAGE,
        value: null,
      })
    }

    setLegendItems({ regular: regularLegendItems, special: specialLegendItems })
  }, [
    props.data,
    props.metricConfig,
    props.mapConfig,
    props.fips,
    props.isMulti,
    props.fipsTypeDisplayName,
    props.isPhrmaAdherence,
    props.isSummaryLegend,
    containerWidth,
  ])

  // Calculate column layout
  const hasSpecialColumn = legendItems.special.length > 0
  const regularColumnsCount = Math.max(1, regularColsCount)
  const totalColumns = hasSpecialColumn
    ? regularColumnsCount + 1
    : regularColumnsCount
  const itemsPerRegularColumn = Math.ceil(
    legendItems.regular.length / regularColumnsCount,
  )

  return (
    <section
      className='mx-4 flex w-full flex-col items-center text-left'
      ref={containerRef}
    >
      <div className='w-full'>
        <div
          className='grid gap-4'
          style={{
            gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
          }}
        >
          <div className='flex justify-center w-full col-span-12'>
            <ClickableLegendHeader
              legendTitle={props.legendTitle}
              dataTypeConfig={props.dataTypeConfig}
            />
          </div>
          {/* Special items column */}
          {hasSpecialColumn && (
            <div className='flex flex-col gap-2'>
              {legendItems.special.map((item, i) => (
                <LegendItem
                  key={`special-${i}`}
                  color={item.color}
                  label={item.label}
                />
              ))}
            </div>
          )}

          {/* Regular items columns */}
          {Array.from({ length: regularColumnsCount }).map((_, colIndex) => (
            <div key={`col-${colIndex}`} className='flex flex-col gap-2'>
              {legendItems.regular
                .slice(
                  colIndex * itemsPerRegularColumn,
                  (colIndex + 1) * itemsPerRegularColumn,
                )
                .map((item, i) => (
                  <LegendItem
                    key={`regular-${colIndex}-${i}`}
                    color={item.color}
                    label={item.label}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
