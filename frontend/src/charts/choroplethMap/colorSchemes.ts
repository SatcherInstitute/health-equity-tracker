import * as d3 from 'd3'
import { hetColors as colorValues } from '../../styles/theme/colorValues'
import { PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import { getLegendDataBounds } from '../mapHelperFunctions'

import type {
  ColorScale,
  ColorScheme,
  CreateColorScaleOptions,
  GetFillColorOptions,
} from './types'

let _colorSchemes: Record<ColorScheme, string[]> | null = null

function getColorSchemes(): Record<ColorScheme, string[]> {
  if (_colorSchemes) return _colorSchemes

  _colorSchemes = {
    darkgreen: [
      colorValues.mapDarker,
      colorValues.mapDark,
      colorValues.mapMid,
      colorValues.mapLight,
      colorValues.mapLighter,
      colorValues.mapLightest,
    ],

    plasma: [
      colorValues.mapWomenDarker,
      colorValues.mapWomenDark,
      colorValues.mapWomenMid,
      colorValues.mapWomenLight,
      colorValues.mapWomenLighter,
      colorValues.mapWomenLightest,
    ],

    inferno: [
      colorValues.mapMenDarker,
      colorValues.mapMenDark,
      colorValues.mapMenMid,
      colorValues.mapMenLight,
      colorValues.mapMenLighter,
      colorValues.mapMenLightest,
    ],

    viridis: [
      colorValues.mapMedicareDarkest,
      colorValues.mapMedicareDark,
      colorValues.mapMedicareMid,
      colorValues.mapMedicareLight,
      colorValues.mapMedicareLighter,
      colorValues.mapMedicareLightest,
    ],

    viridisAdherence: [
      colorValues.mapMedicareDarkest,
      colorValues.mapMedicareDark,
      colorValues.mapMedicareMid,
      colorValues.mapMedicareLight,
      colorValues.mapMedicareLighter,
      colorValues.mapMedicareEvenLighter,
      colorValues.mapMedicareLightest,
    ],

    greenblue: [
      colorValues.unknownMapLeast,
      colorValues.unknownMapLesser,
      colorValues.unknownMapLess,
      colorValues.unknownMapMid,
      colorValues.unknownMapMore,
      colorValues.unknownMapMost,
    ],

    darkred: [
      colorValues.mapYouthDarkest,
      colorValues.mapYouthDarker,
      colorValues.mapYouthDark,
      colorValues.mapYouthLight,
      colorValues.mapYouthLighter,
      colorValues.mapYouthLightest,
    ],
  }

  return _colorSchemes
}

export function createColorScale(options: CreateColorScaleOptions): ColorScale {
  const COLOR_SCHEMES = getColorSchemes()

  const COLOR_SCHEME_INTERPOLATORS: Record<ColorScheme, (t: number) => string> =
    {
      darkgreen: d3.piecewise(
        d3.interpolateRgb.gamma(2.2),
        COLOR_SCHEMES.darkgreen,
      ),

      plasma: d3.piecewise(d3.interpolateRgb.gamma(2.2), COLOR_SCHEMES.plasma),

      inferno: d3.piecewise(
        d3.interpolateRgb.gamma(2.2),
        COLOR_SCHEMES.inferno,
      ),

      viridis: d3.piecewise(
        d3.interpolateRgb.gamma(2.2),
        COLOR_SCHEMES.viridis,
      ),

      viridisAdherence: d3.piecewise(
        d3.interpolateRgb.gamma(2.2),
        COLOR_SCHEMES.viridisAdherence,
      ),

      greenblue: d3.piecewise(
        d3.interpolateRgb.gamma(2.2),
        COLOR_SCHEMES.greenblue,
      ),

      darkred: d3.piecewise(
        d3.interpolateRgb.gamma(2.2),
        COLOR_SCHEMES.darkred,
      ),
    }

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

  let colorArray = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.darkgreen

  if (isSummaryLegend && !isPhrmaAdherence) {
    colorArray = [mapConfig.mid]
  }

  colorArray = reverse ? [...colorArray].reverse() : colorArray

  let interpolatorFn = d3.piecewise(d3.interpolateRgb.gamma(2.2), colorArray)

  const resolvedScheme = colorScheme
    ? COLOR_SCHEME_INTERPOLATORS[colorScheme]
    : interpolatorFn

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

  if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) {
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

  if (!isMultiMap && dataMap.size === 1) {
    return mapConfig.mid
  }

  const value = dataMap.get(d.id as string)?.value as number

  if (value === 0) {
    return mapConfig.zero
  }

  if (value != null && colorScale) {
    return colorScale(value)
  }

  return isExtremesMode ? '#fff' : colorValues.altGray
}
