import type { MapConfig, MetricConfig } from '../data/config/MetricConfigTypes'
/*
To prevent components loading from one another, all exported consts for the map cards should be in this file
*/
import type { DemographicGroup } from '../data/utils/Constants'
import { colors } from '../styles/tokens/colors'
import type { ColorScheme } from './choroplethMap/types'

// Three distinct reasons a value can be absent. Picking the wrong one tells the
// user something false about why the gap exists, so they are not interchangeable:
//
//   DATA_SUPPRESSED  the source measured this and withheld it to protect privacy.
//                    Only ever provable from the rate's own suppressionFlagMetricId
//                    on that same row, and only for the rate and its numerator.
//   NO_DATA_MESSAGE  the source publishes this field but has no value for this geo.
//                    Sits beside the others as a legend swatch and a tooltip value,
//                    so all three read as capitalized labels rather than prose.
//   DATA_UNAVAILABLE the source does not publish this field at all. Denominators
//                    come from a separate source (ACS), so a topic's suppression
//                    rules can never apply to them.
// Extremes mode draws only the highest and lowest geographies. Everything else
// is outside the selection, which is not a claim about whether data exists.
export const NOT_IN_EXTREMES = 'not among the highest or lowest rates'
export const DATA_SUPPRESSED = 'Suppressed'
export const NO_DATA_MESSAGE = 'No data'
export const DATA_UNAVAILABLE = 'Unavailable'
export const SIZE_OF_HIGHEST_LOWEST_GEOS_RATES_LIST = 5

type PopulationSubset =
  | 'default'
  | 'women'
  | 'men'
  | 'medicare'
  | 'medicareAdherence'
  | 'unknown'
  | 'youth'

export const MAP_SCHEMES: Record<PopulationSubset, ColorScheme> = {
  default: 'darkgreen',
  women: 'plasma',
  men: 'inferno',
  medicare: 'viridis',
  medicareAdherence: 'viridisAdherence',
  unknown: 'greenblue',
  youth: 'darkred',
}

export const defaultHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.default,
  zero: colors.mapDarkZero,
  mid: colors.mapMid,
  higherIsBetter: true,
}

export const defaultHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.default,
  zero: colors.mapLightZero,
  mid: colors.mapMid,
  higherIsBetter: false,
}

export const womenHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.women,
  zero: colors.mapWomenDarkZero,
  mid: colors.mapWomenMid,
  higherIsBetter: true,
}

export const womenHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.women,
  zero: colors.mapWomenLightZero,
  mid: colors.mapWomenMid,
  higherIsBetter: false,
}

export const menHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.men,
  zero: colors.mapLightZero,
  mid: colors.mapMid,
  higherIsBetter: false,
}

export const medicareAdherenceHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.medicareAdherence,
  zero: colors.mapMedicareDarkZero,
  mid: colors.mapMedicareMid,
  higherIsBetter: true,
}

export const medicareHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.medicare,
  zero: colors.mapMedicareLightZero,
  mid: colors.mapMedicareMid,
  higherIsBetter: false,
}

export const youthHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.youth,
  zero: colors.mapLightZero,
  mid: colors.mapMid,
  higherIsBetter: false,
}

export const DEFAULT_LEGEND_COLOR_COUNT = 6

export interface HighestLowest {
  highest?: DemographicGroup
  lowest?: DemographicGroup
}

export const PHRMA_ADHERENCE_BREAKPOINTS = [60, 70, 75, 80, 85, 90]

export interface CountColsMap {
  numeratorConfig?: MetricConfig
  denominatorConfig?: MetricConfig
}

export const INVISIBLE_PRELOAD_WIDTH = 25
export const MAP_RESIZE_TOLERANCE = 15

export const ATLANTA_METRO_COUNTY_FIPS = [
  '13089',
  '13121',
  '13135',
  '13067',
  '13063',
]
