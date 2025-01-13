import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import type { RefObject } from 'react'
import type { Topology } from 'topojson-specification'
import type {
  MapConfig,
  MetricConfig,
  MetricId,
} from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { DemographicGroup } from '../../data/utils/Constants'
import type { FieldRange } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import type { CountColsMap, HighestLowest } from '../mapGlobals'

export interface ChoroplethMapProps {
  activeDemographicGroup: DemographicGroup
  countColsMap: CountColsMap
  data: DataPoint[]
  demographicType: DemographicType
  extremesMode: boolean
  fieldRange?: FieldRange
  filename?: string
  fips: Fips
  geoData: Topology
  hideLegend?: boolean
  hideMissingDataTooltip?: boolean
  highestLowestGroupsByFips?: Record<string, HighestLowest>
  isMulti?: boolean
  isPhrmaAdherence?: boolean
  isSummaryLegend?: boolean
  isUnknownsMap?: boolean
  legendData?: Array<Record<string, any>>
  legendTitle?: string | string[]
  mapConfig: MapConfig
  metric: MetricConfig
  overrideShapeWithCircle?: boolean
  scaleConfig?: { domain: number[]; range: number[] }
  showCounties: boolean
  signalListeners?: {
    click?: (name: string, value: { id: string }) => void
  }
  titles?: {
    subtitle?: string
  }
}

export type DataPoint = {
  fips: string
  fips_name: string
} & {
  [key in MetricId]: any
}

// HetRow Type (Extended DataPoint with Additional Fields)
export type HetRow = DataPoint & {
  [key: string]: string | number | null | undefined
}

// Tooltip Pairs for Dynamic Tooltip Labels and Formatters
export type TooltipPairs = {
  [key: string]: (value: number | string | undefined) => string
}

// Props for the Render Map Function
export type RenderMapProps = {
  svgRef: RefObject<SVGSVGElement>
  geoData: {
    features: FeatureCollection<Geometry, GeoJsonProperties>
    projection: d3.GeoProjection
  }
  data: DataPoint[]
  metricId: MetricId
  width: number
  height: number
  tooltipContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>
  tooltipPairs: TooltipPairs
  tooltipLabel: string
  showCounties: boolean
}
