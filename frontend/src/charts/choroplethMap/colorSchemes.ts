import * as d3 from 'd3'
import { het } from '../../styles/DesignTokens'
import { PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import { getLegendDataBounds } from '../mapHelperFunctions'
import type {
  ColorScale,
  ColorScheme,
  CreateColorScaleOptions,
  GetFillColorOptions,
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
  viridisAdherence: [
    het.mapMedicareDarkest,
    het.mapMedicareDark,
    het.mapMedicareMid,
    het.mapMedicareLight,
    het.mapMedicareLighter,
    het.mapMedicareEvenLighter,
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
  viridisAdherence: d3.piecewise(
    d3.interpolateRgb.gamma(2.2),
    COLOR_SCHEMES.viridisAdherence,
  ),
  greenblue: d3.piecewise(
    d3.interpolateRgb.gamma(2.2),
    COLOR_SCHEMES.greenblue,
  ),
  darkred: d3.piecewise(d3.interpolateRgb.gamma(2.2), COLOR_SCHEMES.darkred),
}

export function createColorScale(options: CreateColorScaleOptions): ColorScale {
  const {
    data,
    metricId,
    fieldRange,
    colorScheme,
    reverse,
    isSummaryLegend,
    isPhrmaAdherence,
    mapConfig,
    isUnknown,
  } = options
  let interpolatorFn

  let colorArray = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.darkgreen

  if (isSummaryLegend && !isPhrmaAdherence) {
    colorArray = [mapConfig.mid]
  }

  colorArray = reverse ? [...colorArray].reverse() : colorArray

  interpolatorFn = d3.piecewise(d3.interpolateRgb.gamma(2.2), colorArray)

  const resolvedScheme = colorScheme
    ? COLOR_SCHEME_INTERPOLATORS[colorScheme]
    : colorScheme

  interpolatorFn = reverse
    ? (t: number) => resolvedScheme(1 - t)
    : resolvedScheme

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    data,
    metricId,
  )

  const domain = data
    .map((d) => d[metricId])
    .filter((v) => v != null && v > 0)
    .sort((a, b) => a - b)

  const [min, max] = fieldRange
    ? [fieldRange.min, fieldRange.max]
    : [legendLowerBound, legendUpperBound]

  if (
    min === undefined ||
    max === undefined ||
    Number.isNaN(min) ||
    Number.isNaN(max)
  ) {
    return d3.scaleSequential(interpolatorFn).domain([0, 1])
  }

  if (isUnknown) {
    return d3.scaleSequentialSymlog(interpolatorFn).domain([min, max])
  }

  if (isPhrmaAdherence) {
    return d3
      .scaleThreshold<number, string>()
      .domain(PHRMA_ADHERENCE_BREAKPOINTS)
      .range(colorArray)
  }

  return d3.scaleQuantile<string, number>().domain(domain).range(colorArray)
}

export function getFillColor(options: GetFillColorOptions): string {
  const { d, dataMap, mapConfig, isExtremesMode, colorScale, isMultiMap } =
    options

  if (!isMultiMap && dataMap.size === 1) return mapConfig.mid

  const value = dataMap.get(d.id as string)?.value as number

  if (value === 0) {
    return mapConfig.zero
  }

  if (value != null && colorScale) {
    return colorScale(value)
  }

  return isExtremesMode ? WHITE : ALT_GREY
}
