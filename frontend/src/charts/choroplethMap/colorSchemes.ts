import * as d3 from 'd3'
import type { ColorScheme } from 'vega'
import { het } from '../../styles/DesignTokens'

export const interpolateDarkGreen = d3.piecewise(d3.interpolateRgb.gamma(2.2), [
  het.mapDarkest,
  het.mapDarker,
  het.mapDark,
  het.mapLight,
  het.mapLighter,
  het.mapLightest,
  het.mapLightZero,
])

export const interpolatePlasma = d3.piecewise(d3.interpolateRgb.gamma(2.2), [
  het.mapWomenDarkZero,
  het.mapWomenDarkest,
  het.mapWomenDarker,
  het.mapWomenDark,
  het.mapWomenLight,
  het.mapWomenLighter,
  het.mapWomenLightest,
  het.mapWomenLightZero,
])

export const interpolatedarkRed = d3.piecewise(d3.interpolateRgb.gamma(2.2), [
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
