import * as d3 from 'd3'
import type { FeatureCollection } from 'geojson'
import { feature } from 'topojson-client'
import { GEOGRAPHIES_DATASET_ID } from '../../data/config/MetadataMap'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { isPctType } from '../../data/config/MetricConfigUtils'
import { LESS_THAN_POINT_1 } from '../../data/utils/Constants'
import type { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { type CountColsMap, DATA_SUPPRESSED } from '../mapGlobals'
import { getLegendDataBounds } from '../mapHelperFunctions'
import { D3_MAP_SCHEMES } from './colorSchemes'
import type { CreateColorScaleProps, GetFillColorProps } from './types'

const {
  altGrey: ALT_GREY,
  white: WHITE,
  greyGridColorDarker: BORDER_GREY,
} = het

export const createColorScale = (props: CreateColorScaleProps) => {
  let interpolatorFn

  if (props.scaleConfig?.range) {
    let colorArray = props.scaleConfig.range

    if (props.reverse) {
      colorArray = [...colorArray].reverse()
    }

    interpolatorFn = d3.piecewise(d3.interpolateRgb.gamma(2.2), colorArray)
  } else {
    const resolvedScheme =
      typeof props.colorScheme === 'string'
        ? D3_MAP_SCHEMES[props.colorScheme] || d3.interpolateBlues
        : props.colorScheme

    interpolatorFn = props.reverse
      ? (t: number) => resolvedScheme(1 - t)
      : resolvedScheme
  }

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    props.dataWithHighestLowest,
    props.metricId,
  )

  const [min, max] = props.fieldRange
    ? [props.fieldRange.min, props.fieldRange.max]
    : [legendLowerBound, legendUpperBound]

  if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) {
    return d3.scaleSequential(interpolatorFn).domain([0, 1])
  }

  let colorScale

  if (props.isPhrma) {
    const thresholds = props.scaleConfig?.domain || []
    const colors = props.scaleConfig?.range || []

    colorScale = d3
      .scaleThreshold<number, string>()
      .domain(thresholds)
      .range(colors)
  } else if (props.isUnknown) {
    const darkerInterpolator = (t: number) => {
      const color = d3.color(interpolatorFn(t))
      return color ? color.darker(0.1) : null
    }

    colorScale = d3
      .scaleSequentialSymlog()
      .domain([min, max])
      .interpolator(darkerInterpolator)
  } else {
    const domain = props.scaleConfig?.domain || []
    const range = props.scaleConfig?.range || []

    colorScale = d3.scaleQuantile<string, number>().domain(domain).range(range)
  }

  return colorScale
}

export const createFeatures = async (
  showCounties: boolean,
  parentFips: string,
  geoData?: Record<string, any>,
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
  const { d, dataMap, colorScale, extremesMode, zeroColor, countyColor } = props

  const value = dataMap.get(d.id as string)?.value as number

  if (props.fips?.isCounty()) {
    return countyColor
  }

  if (value === 0) {
    return zeroColor
  }

  if (value !== undefined) {
    return colorScale(value)
  } else {
    return extremesMode ? WHITE : ALT_GREY
  }
}

export const createTooltipContainer = () => {
  return d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', WHITE)
    .style('border', `1px solid ${BORDER_GREY}`)
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('z-index', '1000')
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
  data: Array<Record<string, any>>,
  countColsMap: CountColsMap,
) => {
  return data.map((row) => {
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
