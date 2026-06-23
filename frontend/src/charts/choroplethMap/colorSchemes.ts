import {
  interpolateRgb,
  piecewise,
  scaleQuantile,
  scaleSequential,
  scaleSequentialSymlog,
  scaleThreshold,
} from 'd3'
import { colors } from '../../styles/tokens/colors'
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
      colors.mapDarker,
      colors.mapDark,
      colors.mapMid,
      colors.mapLight,
      colors.mapLighter,
      colors.mapLightest,
    ],

    plasma: [
      colors.mapWomenDarker,
      colors.mapWomenDark,
      colors.mapWomenMid,
      colors.mapWomenLight,
      colors.mapWomenLighter,
      colors.mapWomenLightest,
    ],

    inferno: [
      colors.mapMenDarker,
      colors.mapMenDark,
      colors.mapMenMid,
      colors.mapMenLight,
      colors.mapMenLighter,
      colors.mapMenLightest,
    ],

    viridis: [
      colors.mapMedicareDarkest,
      colors.mapMedicareDark,
      colors.mapMedicareMid,
      colors.mapMedicareLight,
      colors.mapMedicareLighter,
      colors.mapMedicareLightest,
    ],

    viridisAdherence: [
      colors.mapMedicareDarkest,
      colors.mapMedicareDark,
      colors.mapMedicareMid,
      colors.mapMedicareLight,
      colors.mapMedicareLighter,
      colors.mapMedicareEvenLighter,
      colors.mapMedicareLightest,
    ],

    greenblue: [
      colors.unknownMapLeast,
      colors.unknownMapLesser,
      colors.unknownMapLess,
      colors.unknownMapMid,
      colors.unknownMapMore,
      colors.unknownMapMost,
    ],

    darkred: [
      colors.mapYouthDarkest,
      colors.mapYouthDarker,
      colors.mapYouthDark,
      colors.mapYouthLight,
      colors.mapYouthLighter,
      colors.mapYouthLightest,
    ],
  }

  return _colorSchemes
}

// Static — built once at module load. getColorSchemes() is itself cached,
// and interpolateRgb.gamma(2.2) has no runtime dependencies.
const _interpolator = interpolateRgb.gamma(2.2)
let _colorSchemeInterpolators: Record<
  ColorScheme,
  (t: number) => string
> | null = null

function getColorSchemeInterpolators(): Record<
  ColorScheme,
  (t: number) => string
> {
  if (_colorSchemeInterpolators) return _colorSchemeInterpolators
  const COLOR_SCHEMES = getColorSchemes()
  _colorSchemeInterpolators = {
    darkgreen: piecewise(_interpolator, COLOR_SCHEMES.darkgreen),
    plasma: piecewise(_interpolator, COLOR_SCHEMES.plasma),
    inferno: piecewise(_interpolator, COLOR_SCHEMES.inferno),
    viridis: piecewise(_interpolator, COLOR_SCHEMES.viridis),
    viridisAdherence: piecewise(_interpolator, COLOR_SCHEMES.viridisAdherence),
    greenblue: piecewise(_interpolator, COLOR_SCHEMES.greenblue),
    darkred: piecewise(_interpolator, COLOR_SCHEMES.darkred),
  }
  return _colorSchemeInterpolators
}

export function createColorScale(options: CreateColorScaleOptions): ColorScale {
  const COLOR_SCHEMES = getColorSchemes()
  const COLOR_SCHEME_INTERPOLATORS = getColorSchemeInterpolators()

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

  let interpolatorFn = piecewise(_interpolator, colorArray)

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
    return scaleSequential(interpolatorFn).domain([0, 1])
  }

  if (isUnknown) {
    return scaleSequentialSymlog(interpolatorFn).domain([min, max])
  }

  if (isPhrmaAdherence) {
    return scaleThreshold<number, string>()
      .domain(PHRMA_ADHERENCE_BREAKPOINTS)
      .range(colorArray)
  }

  const uniqueDomainValues = [...new Set(domain)].sort((a, b) => a - b)
  if (
    uniqueDomainValues.length > 0 &&
    uniqueDomainValues.length <= colorArray.length
  ) {
    // Discrete data: use threshold scale so each distinct value gets its own
    // color bucket rather than letting quantile over-represent common values
    // (e.g. CAWP county percentages where most counties share a single value).
    return scaleThreshold<number, string>()
      .domain(uniqueDomainValues)
      .range(colorArray.slice(0, uniqueDomainValues.length + 1))
  }

  return scaleQuantile<string, number>().domain(domain).range(colorArray)
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

  return isExtremesMode ? '#fff' : colors.altGray
}
