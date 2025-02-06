import * as d3 from 'd3'
import type { FeatureCollection } from 'geojson'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import { GEOGRAPHIES_DATASET_ID } from '../../data/config/MetadataMap'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { isPctType } from '../../data/config/MetricConfigUtils'
import { LESS_THAN_POINT_1 } from '../../data/utils/Constants'
import type { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { type CountColsMap, DATA_SUPPRESSED } from '../mapGlobals'
import { getLegendDataBounds } from '../mapHelperFunctions'
import { D3_MAP_SCHEMES } from './colorSchemes'
import type { CreateColorScaleProps, GetFillColorProps, HetRow } from './types'

const { altGrey: ALT_GREY, white: WHITE } = het

export const createColorScale = (props: CreateColorScaleProps) => {
  // Resolve string-based Vega schemes to D3 functions
  const resolvedScheme =
    typeof props.colorScheme === 'string'
      ? D3_MAP_SCHEMES[props.colorScheme] || d3.interpolateBlues
      : props.colorScheme

  // Handle reversing the color scale
  const interpolatorFn = props.reverse
    ? (t: number) => resolvedScheme(1 - t)
    : resolvedScheme

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    props.data,
    props.metricId,
  )

  const [min, max] = props.fieldRange
    ? [props.fieldRange.min, props.fieldRange.max]
    : [legendLowerBound, legendUpperBound]

  if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) {
    return d3.scaleSequential(interpolatorFn).domain([0, 1])
  }

  const adjustedInterpolatorFn = (t: number) => {
    const adjustedT = 0.1 + 0.9 * t // Scale the range to skip the lightest 10%
    return interpolatorFn(adjustedT)
  }

  let colorScale

  if (props.isUnknown || props.fips.isCounty()) {
    colorScale = d3
      .scaleSequentialSymlog()
      .domain([min, max])
      .interpolator(adjustedInterpolatorFn)
  } else {
    const values = props.data
      .map((d) => d[props.metricId])
      .filter((val) => val != null && !isNaN(val))

    colorScale = d3
      .scaleSequentialQuantile(adjustedInterpolatorFn)
      .domain(values)
  }

  return colorScale
}

export const createFeatures = async (
  showCounties: boolean,
  parentFips: string,
  geoData?: Topology,
): Promise<FeatureCollection> => {
  const topology =
    geoData ??
    JSON.parse(
      new TextDecoder().decode(
        await window.fs.readFile(`/tmp/${GEOGRAPHIES_DATASET_ID}.json`),
      ),
    )

  const geographyKey = showCounties ? 'counties' : 'states'

  const features = feature(
    topology,
    topology.objects[geographyKey],
  ) as unknown as FeatureCollection

  const filtered =
    parentFips === '00'
      ? features
      : {
          ...features,
          features: features.features.filter((f) =>
            String(f.id)?.startsWith(parentFips),
          ),
        }

  return filtered.features.length ? filtered : features
}

export const createProjection = (
  fips: Fips,
  width: number,
  height: number,
  features: FeatureCollection,
): d3.GeoProjection => {
  const isTerritory = fips.isTerritory() || fips.getParentFips().isTerritory()
  return isTerritory
    ? d3.geoAlbers().fitSize([width, height], features)
    : d3.geoAlbersUsa().fitSize([width, height], features)
}

export const getFillColor = (props: GetFillColorProps): string => {
  const { d, dataMap, colorScale, extremesMode } = props

  const value = dataMap.get(d.id as string)?.value as number

  if (value !== undefined) {
    return colorScale(value)
  } else {
    return extremesMode ? WHITE : ALT_GREY
  }
}

export const formatMetricValue = (
  value: number | undefined,
  metricConfig: MetricConfig,
): string => {
  if (value === undefined) return 'no data'

  if (metricConfig.type === 'per100k') {
    if (value < 0.1) return `${LESS_THAN_POINT_1} per 100k`
    return `${d3.format(',.2s')(value)} per 100k`
  }

  if (isPctType(metricConfig.type)) {
    return `${d3.format('d')(value)}%`
  }

  return d3.format(',.2r')(value)
}

export const processPhrmaData = (
  data: HetRow[],
  countColsMap: CountColsMap,
) => {
  return data.map((row: HetRow) => {
    const newRow = { ...row }

    const processField = (
      fieldConfig:
        | typeof countColsMap.numeratorConfig
        | typeof countColsMap.denominatorConfig,
    ) => {
      if (!fieldConfig) return

      const value = row[fieldConfig.metricId]
      if (value === null) return DATA_SUPPRESSED
      if (value >= 0) return value.toLocaleString()
      return value
    }

    const numeratorId = countColsMap?.numeratorConfig?.metricId
    const denominatorId = countColsMap?.denominatorConfig?.metricId

    if (numeratorId) {
      newRow[numeratorId] = processField(countColsMap?.numeratorConfig)
    }
    if (denominatorId) {
      newRow[denominatorId] = processField(countColsMap?.denominatorConfig)
    }

    return newRow
  })
}
