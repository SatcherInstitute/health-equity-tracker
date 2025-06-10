import { useEffect, useState } from 'react'
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
import { formatMetricValue } from './tooltipUtils'
import { type ColorScale, isQuantileScale } from './types'

export const LEGEND_ITEMS_BOX_CLASS = 'legend-items-box'

interface LegendItemData {
  color: string
  label: string
  value: any
}
interface RateMapLegendProps {
  dataTypeConfig: DataTypeConfig
  data?: Array<Record<string, any>>
  metricConfig: MetricConfig
  fieldRange?: FieldRange
  description: string
  fipsTypeDisplayName?: GeographicBreakdown
  mapConfig: MapConfig
  isPhrmaAdherence: boolean
  isSummaryLegend?: boolean
  fips: Fips
  isMulti?: boolean
  legendTitle: string
  isCompareMode?: boolean
  colorScale: ColorScale
}

export default function RateMapLegend(props: RateMapLegendProps) {
  function labelFormat(value: number) {
    return formatMetricValue(value, props.metricConfig, true)
  }

  const [containerRef] = useResponsiveWidth()
  const [legendItems, setLegendItems] = useState<LegendItemData[]>([])

  // Process data and create legend items
  useEffect(() => {
    if (!props.data) {
      return
    }

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

    const regularLegendItems: LegendItemData[] = []
    const specialLegendItems: LegendItemData[] = []

    if (uniqueNonZeroValues.length > 0 && !props.isSummaryLegend) {
      const colorScale = props.colorScale

      const thresholds = props.isPhrmaAdherence
        ? PHRMA_ADHERENCE_BREAKPOINTS
        : isQuantileScale(colorScale)
          ? colorScale.quantiles()
          : []
      if (thresholds.length > 0) {
        const firstThreshold = thresholds[0]
        const lastThreshold = thresholds[thresholds.length - 1]

        regularLegendItems.push(
          {
            value: firstThreshold - 1,
            label: `< ${labelFormat(firstThreshold)}`,
            color: colorScale(firstThreshold - 1) as string,
          },
          ...thresholds.slice(0, -1).map((threshold: number, i: number) => ({
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

    if (hasMissingData) {
      specialLegendItems.push({
        color: het.howToColor,
        label: NO_DATA_MESSAGE,
        value: null,
      })
    }

    if (hasZeroData) {
      specialLegendItems.push({
        color: props.mapConfig.zero || het.mapLightest,
        label: labelFormat(0),
        value: 0,
      })
    }

    setLegendItems([...specialLegendItems, ...regularLegendItems])
  }, [
    props.data,
    props.metricConfig,
    props.mapConfig,
    props.fips,
    props.isMulti,
    props.fipsTypeDisplayName,
    props.isPhrmaAdherence,
    props.isSummaryLegend,
  ])

  return (
    <section
      className={`mx-4 flex w-full flex-col items-start text-left ${
        props.isMulti ? 'md:mx-auto md:w-1/2' : ''
      }`}
      aria-label='Legend for rate map'
      ref={containerRef}
    >
      <div className='w-full'>
        <div className='flex w-full flex-col items-center'>
          <div className='mt-4 mb-0 flex w-full justify-center'>
            <ClickableLegendHeader
              legendTitle={props.legendTitle}
              dataTypeConfig={props.dataTypeConfig}
            />
          </div>

          <div
            // all views
            className={`${LEGEND_ITEMS_BOX_CLASS} w-2/3 columns-1 tiny:columns-2 gap-1 space-y-1 border-0 border-grey-grid-color-darker border-t border-solid px-4 pt-4 ${
              props.isMulti
                ? // multimap only
                  'columns-auto sm:columns-3 lg:columns-4'
                : props.isCompareMode
                  ? // compare mode only
                    'smplus:columns-3 md:columns-2 lg:columns-3'
                  : // non-compare mode only
                    'sm:columns-1'
            }`}
          >
            {legendItems.map((item) => (
              <div key={item.label} className='mb-1 break-inside-avoid'>
                <LegendItem color={item.color} label={item.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
