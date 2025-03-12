import * as d3 from 'd3'
import { het } from '../../styles/DesignTokens'
import { PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import { getLegendDataBounds } from '../mapHelperFunctions'
import type {
  ColorScheme,
  CreateColorScaleProps,
  GetFillColorProps,
} from './types'

const { altGrey: ALT_GREY, white: WHITE } = het

const COLOR_SCHEMES: Record<ColorScheme, string[]> = {
  darkgreen: [
    het.mapDarker,
    het.mapDark,
    het.mapMid,
    het.mapLight,
    het.mapLighter,
    het.mapLightest,
  ],
  plasma: [
    het.mapWomenDarker,
    het.mapWomenDark,
    het.mapWomenMid,
    het.mapWomenLight,
    het.mapWomenLighter,
    het.mapWomenLightest,
  ],
  inferno: [
    het.mapMenDarker,
    het.mapMenDark,
    het.mapMenMid,
    het.mapMenLight,
    het.mapMenLighter,
    het.mapMenLighest,
  ],
  viridis: [
    het.mapMedicareDarkest,
    het.mapMedicareDark,
    het.mapMedicareMid,
    het.mapMedicareLight,
    het.mapMedicareLighter,
    het.mapMedicareLightest,
  ],
  greenblue: [
    het.unknownMapLeast,
    het.unknownMapLesser,
    het.unknownMapLess,
    het.unknownMapMid,
    het.unknownMapMore,
    het.unknownMapMost,
  ],
  darkred: [
    het.mapYouthDarkest,
    het.mapYouthDarker,
    het.mapYouthDark,
    het.mapYouthLight,
    het.mapYouthLighter,
    het.mapYouthLightest,
  ],
}

// A mapping of color scheme names to their corresponding interpolated color functions.
const COLOR_SCHEME_INTERPOLATORS: Record<ColorScheme, (t: number) => string> = {
  darkgreen: d3.piecewise(
    d3.interpolateRgb.gamma(2.2),
    COLOR_SCHEMES.darkgreen,
  ),
  plasma: d3.piecewise(d3.interpolateRgb.gamma(2.2), COLOR_SCHEMES.plasma),
  inferno: d3.piecewise(d3.interpolateRgb.gamma(2.2), COLOR_SCHEMES.inferno),
  viridis: d3.piecewise(d3.interpolateRgb.gamma(2.2), COLOR_SCHEMES.viridis),
  greenblue: d3.piecewise(
    d3.interpolateRgb.gamma(2.2),
    COLOR_SCHEMES.greenblue,
  ),
  darkred: d3.piecewise(d3.interpolateRgb.gamma(2.2), COLOR_SCHEMES.darkred),
}

export const createColorScale = (props: CreateColorScaleProps) => {
  let interpolatorFn

  let colorArray =
    COLOR_SCHEMES[props.colorScheme] || COLOR_SCHEMES['darkgreen']

  colorArray = props.reverse ? [...colorArray].reverse() : colorArray

  interpolatorFn = d3.piecewise(d3.interpolateRgb.gamma(2.2), colorArray)

  const resolvedScheme = props.colorScheme
    ? COLOR_SCHEME_INTERPOLATORS[props.colorScheme]
    : props.colorScheme

  interpolatorFn = props.reverse
    ? (t: number) => resolvedScheme(1 - t)
    : resolvedScheme

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    props.data,
    props.metricId,
  )

  const domain = props.data
    .map((d) => d[props.metricId])
    .filter((v) => v != null && v > 0)
    .sort((a, b) => a - b)

  const [min, max] = props.fieldRange
    ? [props.fieldRange.min, props.fieldRange.max]
    : [legendLowerBound, legendUpperBound]

  if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) {
    return d3.scaleSequential(interpolatorFn).domain([0, 1])
  }

  if (props.isUnknown) {
    return d3.scaleSequentialSymlog(interpolatorFn).domain([min, max])
  }

  if (props.isPhrma) {
    return d3
      .scaleThreshold<number, string>()
      .domain(PHRMA_ADHERENCE_BREAKPOINTS)
      .range(colorArray)
  }

  return d3.scaleQuantile<string, number>().domain(domain).range(colorArray)
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
