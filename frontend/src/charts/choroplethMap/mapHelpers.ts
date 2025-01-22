import * as d3 from 'd3'
import type { FeatureCollection } from 'geojson'
import { feature } from 'topojson-client'
import { scaleType } from 'vega-lite/build/src/compile/scale/type'
import { GEOGRAPHIES_DATASET_ID } from '../../data/config/MetadataMap'
import { getLegendDataBounds } from '../mapHelperFunctions'
import type {
  CreateColorScaleProps,
  CreateFeaturesProps,
  CreateProjectionProps,
  GetFillColorProps,
} from './types'

const DEFAULT_FILL = '#ccc'

export const createColorScale = (props: CreateColorScaleProps) => {
  const interpolatorFn = props.reverse
    ? (t: number) => props.colorScheme(1 - t)
    : props.colorScheme

  let colorScale: d3.ScaleSequential<string>

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    props.data,
    props.metricId,
  )

  const [min, max] = props.fieldRange
    ? [props.fieldRange.min, props.fieldRange.max]
    : [legendLowerBound, legendUpperBound]

  if (props.scaleType === 'quantileSequential') {
    const values = props.data
      .map((d) => d[props.metricId])
      .filter((val) => val != null)
    d3.scaleSequentialSymlog
    colorScale = d3
      .scaleSequentialQuantile<string>(interpolatorFn)
      .domain(values)
  } else if (props.scaleType === 'sequentialSymlog') {
    colorScale = d3
      .scaleSequentialSymlog<string>()
      .domain([min, max])
      .interpolator(interpolatorFn)
  } else {
    throw new Error(`Unsupported scaleType: ${scaleType}`)
  }

  return colorScale
}

export const createFeatures = async (
  props: CreateFeaturesProps,
): Promise<FeatureCollection> => {
  const { showCounties, parentFips, geoData } = props

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
  props: CreateProjectionProps,
): d3.GeoProjection => {
  const { fips, width, height, features } = props

  const isTerritory = fips.isTerritory() || fips.getParentFips().isTerritory()
  return isTerritory
    ? d3.geoAlbers().fitSize([width, height], features)
    : d3.geoAlbersUsa().fitSize([width, height], features)
}

export const getFillColor = (props: GetFillColorProps): string => {
  const { d, dataMap, colorScale } = props

  const value = dataMap.get(d.id as string)
  return value !== undefined ? colorScale(value) : DEFAULT_FILL
}
