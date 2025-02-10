import type * as d3 from 'd3'
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson'
import type { RefObject } from 'react'
import type { Topology } from 'topojson-specification'
import type { ColorScheme } from 'vega'
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
  demographicType: DemographicType
  data: Array<Record<string, any>>
  extremesMode: boolean
  fips: Fips
  fieldRange?: FieldRange
  filename?: string
  geoData?: Record<string, any>
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
  signalListeners?: {
    click?: (name: string, value: { id: string }) => void
  }
  showCounties: boolean
  titles?: {
    subtitle?: string
  }
  updateFipsCallback: (fips: Fips) => void
  scaleConfig: {
    domain: number[]
    range: string[]
  }
}

export interface CreateColorScaleProps {
  dataWithHighestLowest: DataPoint[]
  metricId: MetricId
  colorScheme: ColorScheme | ((t: number) => string)
  reverse?: boolean
  fieldRange?: FieldRange
  isUnknown?: boolean
  fips: Fips
  scaleConfig: {
    domain: number[]
    range: string[]
  }
}

export type CreateFeaturesProps = {
  showCounties: boolean
  parentFips: string
  geoData?: Topology
}

export type CreateProjectionProps = {
  fips: Fips
  width: number
  height: number
  features: FeatureCollection
}

export type DataPoint = {
  fips: string
  fips_name: string
  highestGroup?: string
  lowestGroup?: string
  rating?: string
} & {
  [key in MetricId]: any
}

export type GetFillColorProps = {
  d: Feature<Geometry, GeoJsonProperties>
  dataMap: Map<string, MetricData>
  colorScale: d3.ScaleSequential<string, never>
  extremesMode?: boolean
}

export type HetRow = DataPoint & {
  [key: string]: string | number | undefined
}

export type InitializeSvgProps = {
  svgRef: React.RefObject<SVGSVGElement>
  width: number
  height: number
  isMobile: boolean
}

export interface MetricData {
  [key: string]: string | number | undefined
}

export type RenderMapProps = {
  activeDemographicGroup: DemographicGroup
  colorScale: d3.ScaleSequential<string>
  countColsMap: CountColsMap
  dataWithHighestLowest: DataPoint[]
  demographicType: DemographicType
  geoData: {
    features: FeatureCollection<Geometry, GeoJsonProperties>
    projection: d3.GeoProjection
  }
  height: number
  hideLegend?: boolean
  isUnknownsMap?: boolean
  metric: MetricConfig
  showCounties: boolean
  svgRef: RefObject<SVGSVGElement>
  tooltipContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>
  updateFipsCallback: (fips: Fips) => void
  width: number
  fips: Fips
  isMobile: boolean
  isCawp: boolean
  extremesMode: boolean
}

export type TooltipFeature = {
  properties: GeoJsonProperties
  id?: string | number
}

export type TooltipPairs = {
  [key: string]: (value: number | string | undefined) => string
}

/**
 * Extended Window interface for file system access
 */
declare global {
  interface Window {
    fs: {
      readFile: (
        path: string,
        options?: { encoding?: string },
      ) => Promise<Uint8Array>
    }
  }
}
