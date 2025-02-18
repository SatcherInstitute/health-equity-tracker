import * as d3 from 'd3'
import { het } from '../../styles/DesignTokens'
import { getLegendDataBounds } from '../mapHelperFunctions'
import type {
  ColorScheme,
  CreateColorScaleProps,
  GetFillColorProps,
} from './types'

const { altGrey: ALT_GREY, white: WHITE } = het

const interpolateDarkGreen = d3.piecewise(d3.interpolateRgb.gamma(2.2), [
  het.mapDarkest,
  het.mapDarker,
  het.mapDark,
  het.mapLight,
  het.mapLighter,
  het.mapLightest,
  het.mapLightZero,
])

const interpolatePlasma = d3.piecewise(d3.interpolateRgb.gamma(2.2), [
  het.mapWomenDarkZero,
  het.mapWomenDarkest,
  het.mapWomenDarker,
  het.mapWomenDark,
  het.mapWomenLight,
  het.mapWomenLighter,
  het.mapWomenLightest,
  het.mapWomenLightZero,
])

const interpolatedarkRed = d3.piecewise(d3.interpolateRgb.gamma(2.2), [
  het.mapYouthDarkZero,
  het.mapYouthDarkest,
  het.mapYouthDarker,
  het.mapYouthDark,
  het.mapYouthMid,
  het.mapYouthLight,
  het.mapYouthLighter,
  het.mapYouthLightest,
  het.mapYouthLightZero,
])

export const D3_MAP_SCHEMES: Partial<
  Record<ColorScheme, (t: number) => string>
> = {
  darkgreen: interpolateDarkGreen,
  plasma: interpolatePlasma,
  inferno: d3.interpolateInferno,
  viridis: d3.interpolateViridis,
  greenblue: d3.interpolateGnBu,
  darkred: interpolatedarkRed,
}

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

  if (props.isPhrma) {
    const thresholds = props.scaleConfig?.domain || []
    const colors = props.scaleConfig?.range || []
    return d3.scaleThreshold<number, string>().domain(thresholds).range(colors)
  }

  if (props.isUnknown) {
    const darkerInterpolator = (t: number) => {
      const color = d3.color(interpolatorFn(t))
      return color ? color.darker(0.1) : null
    }
    return d3
      .scaleSequentialSymlog()
      .domain([min, max])
      .interpolator(darkerInterpolator)
  }

  const domain = props.scaleConfig?.domain || []
  const range = props.scaleConfig?.range || []
  return d3.scaleQuantile<string, number>().domain(domain).range(range)
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

  if (value != null) {
    return colorScale(value)
  }

  return extremesMode ? WHITE : ALT_GREY
}
