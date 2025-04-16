import type * as d3 from 'd3'
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson'
import type { RefObject } from 'react'

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

export type ColorScheme =
  | 'darkgreen'
  | 'plasma'
  | 'inferno'
  | 'viridis'
  | 'viridisAdherence'
  | 'greenblue'
  | 'darkred'

export type ColorScale =
  | d3.ScaleSequential<any, never>
  | d3.ScaleThreshold<number, string, never>
  | d3.ScaleQuantile<string, number>

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
  isPhrmaAdherence: boolean
  isSummaryLegend?: boolean
  isUnknownsMap?: boolean
  legendData?: Array<Record<string, any>>
  legendTitle?: string | string[]
  mapConfig: MapConfig
  metricConfig: MetricConfig
  signalListeners?: {
    click?: (name: string, value: { id: string }) => void
  }
  showCounties: boolean
  titles?: {
    subtitle?: string
  }
  isAtlantaMode?: boolean
}

export interface CreateColorScaleProps {
  data: Array<Record<string, any>> | DataPoint[]
  metricId: MetricId
  mapConfig: MapConfig
  colorScheme: ColorScheme
  reverse?: boolean
  fieldRange?: FieldRange
  isUnknown?: boolean
  fips: Fips
  isPhrmaAdherence: boolean
  isSummaryLegend?: boolean
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
  colorScale: ColorScale
  mapConfig: MapConfig
  extremesMode?: boolean
  isMultiMap?: boolean
}

export type HetRow = DataPoint & {
  [key: string]: string | number | undefined
}

export type InitializeSvgProps = {
  svgRef: React.RefObject<SVGSVGElement>
  width: number
  height: number
  isMobile: boolean
  isUnknownsMap?: boolean
}

export interface MetricData {
  [key: string]: string | number | undefined
}

export type RenderMapProps = {
  activeDemographicGroup: DemographicGroup
  colorScale: ColorScale
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
  metricConfig: MetricConfig
  showCounties: boolean
  svgRef: RefObject<SVGSVGElement>
  tooltipContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>
  width: number
  fips: Fips
  isMobile: boolean
  isCawp: boolean
  extremesMode: boolean
  mapConfig: MapConfig
  signalListeners: any
  isMulti?: boolean
}

type TooltipFeature = {
  properties: GeoJsonProperties
  id?: string | number
}

type TooltipPairs = {
  [key: string]: (value: number | string | undefined) => string
}

interface MouseEventHandlerProps {
  colorScale: ColorScale
  metricConfig: MetricConfig
  dataMap: Map<string, MetricData>
  tooltipContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>
  geographyType?: string
  extremesMode?: boolean
  mapConfig: MapConfig
  fips?: Fips
  isPhrmaAdherence: boolean
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
