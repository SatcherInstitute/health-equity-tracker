import * as d3 from 'd3'
import { het } from '../../styles/theme/cssVarsToJsColors'
import { resolveCssVar } from '../../styles/theme/themeUtils'
import { PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import { getLegendDataBounds } from '../mapHelperFunctions'
import type {
  ColorScale,
  ColorScheme,
  CreateColorScaleOptions,
  GetFillColorOptions,
} from './types'

function getColorSchemes(): Record<ColorScheme, string[]> {
  return {
    darkgreen: [
      resolveCssVar(het.mapDarker),
      resolveCssVar(het.mapDark),
      resolveCssVar(het.mapMid),
      resolveCssVar(het.mapLight),
      resolveCssVar(het.mapLighter),
      resolveCssVar(het.mapLightest),
    ],
    plasma: [
      resolveCssVar(het.mapWomenDarker),
      resolveCssVar(het.mapWomenDark),
      resolveCssVar(het.mapWomenMid),
      resolveCssVar(het.mapWomenLight),
      resolveCssVar(het.mapWomenLighter),
      resolveCssVar(het.mapWomenLightest),
    ],
    inferno: [
      resolveCssVar(het.mapMenDarker),
      resolveCssVar(het.mapMenDark),
      resolveCssVar(het.mapMenMid),
      resolveCssVar(het.mapMenLight),
      resolveCssVar(het.mapMenLighter),
      resolveCssVar(het.mapMenLightest),
    ],
    viridis: [
      resolveCssVar(het.mapMedicareDarkest),
      resolveCssVar(het.mapMedicareDark),
      resolveCssVar(het.mapMedicareMid),
      resolveCssVar(het.mapMedicareLight),
      resolveCssVar(het.mapMedicareLighter),
      resolveCssVar(het.mapMedicareLightest),
    ],
    viridisAdherence: [
      resolveCssVar(het.mapMedicareDarkest),
      resolveCssVar(het.mapMedicareDark),
      resolveCssVar(het.mapMedicareMid),
      resolveCssVar(het.mapMedicareLight),
      resolveCssVar(het.mapMedicareLighter),
      resolveCssVar(het.mapMedicareEvenLighter),
      resolveCssVar(het.mapMedicareLightest),
    ],
    greenblue: [
      resolveCssVar(het.unknownMapLeast),
      resolveCssVar(het.unknownMapLesser),
      resolveCssVar(het.unknownMapLess),
      resolveCssVar(het.unknownMapMid),
      resolveCssVar(het.unknownMapMore),
      resolveCssVar(het.unknownMapMost),
    ],
    darkred: [
      resolveCssVar(het.mapYouthDarkest),
      resolveCssVar(het.mapYouthDarker),
      resolveCssVar(het.mapYouthDark),
      resolveCssVar(het.mapYouthLight),
      resolveCssVar(het.mapYouthLighter),
      resolveCssVar(het.mapYouthLightest),
    ],
  }
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
  let interpolatorFn

  let colorArray = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES['darkgreen']

  if (isSummaryLegend && !isPhrmaAdherence) {
    colorArray = [resolveCssVar(mapConfig.mid)]
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

  if (!isMultiMap && dataMap.size === 1) return resolveCssVar(mapConfig.mid)

  const value = dataMap.get(d.id as string)?.value as number

  if (value === 0) {
    return mapConfig.zero
  }

  if (value != null && colorScale) {
    return colorScale(value)
  }

  return isExtremesMode ? '#fff' : het.altGray
}
