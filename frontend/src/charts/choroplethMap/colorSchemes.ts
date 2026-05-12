import * as d3 from 'd3'
import { hetColors } from '../../styles/theme/colorValues'
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
      hetColors.mapDarker,
      hetColors.mapDark,
      hetColors.mapMid,
      hetColors.mapLight,
      hetColors.mapLighter,
      hetColors.mapLightest,
    ],

    plasma: [
      hetColors.mapWomenDarker,
      hetColors.mapWomenDark,
      hetColors.mapWomenMid,
      hetColors.mapWomenLight,
      hetColors.mapWomenLighter,
      hetColors.mapWomenLightest,
    ],

    inferno: [
      hetColors.mapMenDarker,
      hetColors.mapMenDark,
      hetColors.mapMenMid,
      hetColors.mapMenLight,
      hetColors.mapMenLighter,
      hetColors.mapMenLightest,
    ],

    viridis: [
      hetColors.mapMedicareDarkest,
      hetColors.mapMedicareDark,
      hetColors.mapMedicareMid,
      hetColors.mapMedicareLight,
      hetColors.mapMedicareLighter,
      hetColors.mapMedicareLightest,
    ],

    viridisAdherence: [
      hetColors.mapMedicareDarkest,
      hetColors.mapMedicareDark,
      hetColors.mapMedicareMid,
      hetColors.mapMedicareLight,
      hetColors.mapMedicareLighter,
      hetColors.mapMedicareEvenLighter,
      hetColors.mapMedicareLightest,
    ],

    greenblue: [
      hetColors.unknownMapLeast,
      hetColors.unknownMapLesser,
      hetColors.unknownMapLess,
      hetColors.unknownMapMid,
      hetColors.unknownMapMore,
      hetColors.unknownMapMost,
    ],

    darkred: [
      hetColors.mapYouthDarkest,
      hetColors.mapYouthDarker,
      hetColors.mapYouthDark,
      hetColors.mapYouthLight,
      hetColors.mapYouthLighter,
      hetColors.mapYouthLightest,
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

  return isExtremesMode ? '#fff' : hetColors.altGray
}
