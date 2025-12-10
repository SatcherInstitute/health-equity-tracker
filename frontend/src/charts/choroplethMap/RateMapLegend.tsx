import { useEffect, useState } from 'react'
import type {
  DataTypeConfig,
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import type { GeographicBreakdown } from '../../data/query/Breakdowns'
import type { FieldRange } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import ClickableLegendHeader from '../ClickableLegendHeader'
import LegendItem from './LegendItem'
import { processLegendData } from './legendDataProcessor'
import type { LegendItemData } from './mapLegendUtils'
import type { ColorScale } from './types'

export const LEGEND_ITEMS_BOX_CLASS = 'legend-items-box'

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
  allMissingDataIsSuppressed?: boolean
}

export default function RateMapLegend(props: RateMapLegendProps) {
  const {
    data,
    metricConfig,
    mapConfig,
    fips,
    isMulti,
    fipsTypeDisplayName,
    isPhrmaAdherence,
    isSummaryLegend,
    colorScale,
    allMissingDataIsSuppressed,
  } = props

  const [containerRef] = useResponsiveWidth()
  const [legendItems, setLegendItems] = useState<LegendItemData[]>([])

  // Process data and create legend items
  useEffect(() => {
    if (!data) {
      return
    }

    const { specialItems, regularItems } = processLegendData(props)

    setLegendItems([...specialItems, ...regularItems])
  }, [
    data,
    metricConfig,
    mapConfig,
    fips,
    isMulti,
    fipsTypeDisplayName,
    isPhrmaAdherence,
    isSummaryLegend,
    colorScale,
    allMissingDataIsSuppressed,
  ])

  return (
    <section
      className={`mx-4 flex w-full flex-col items-start text-left ${
        isMulti ? 'md:mx-auto md:w-1/2' : ''
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
