import type { MapConfig, MetricConfig } from '../data/config/MetricConfigTypes'
/*
To prevent components loading from one another, all exported consts for the map cards should be in this file
*/
import type { DemographicGroup } from '../data/utils/Constants'
import { het } from '../styles/DesignTokens'
import type { ColorScheme } from './choroplethMap/types'

export const DATA_SUPPRESSED = 'Data suppressed'
const COLOR_SCALE = 'COLOR_SCALE'
const ZERO_SCALE = 'ZERO_SCALE'

type ScaleType = 'quantile' | 'symlog'
type StackingDirection = 'horizontal' | 'vertical'

export const RATE_MAP_SCALE: ScaleType = 'quantile'

const ORDINAL = 'ordinal'

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
  zero: het.mapDarkZero,
  mid: het.mapMid,
  higherIsBetter: true,
}

export const defaultHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.default,
  zero: het.mapLightZero,
  mid: het.mapMid,
  higherIsBetter: false,
}

export const womenHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.women,
  zero: het.mapWomenDarkZero,
  mid: het.mapWomenMid,
  higherIsBetter: true,
}

export const womenHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.women,
  zero: het.mapWomenLightZero,
  mid: het.mapWomenMid,
  higherIsBetter: false,
}

export const menHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.men,
  zero: het.mapLightZero,
  mid: het.mapMid,
  higherIsBetter: false,
}

export const medicareAdherenceHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.medicareAdherence,
  zero: het.mapMedicareDarkZero,
  mid: het.mapMedicareMid,
  higherIsBetter: true,
}

export const medicareHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.medicare,
  zero: het.mapMedicareLightZero,
  mid: het.mapMedicareMid,
  higherIsBetter: false,
}

export const youthHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.youth,
  zero: het.mapLightZero,
  mid: het.mapMid,
  higherIsBetter: false,
}

const DOT_SIZE_SCALE = 'dot_size_scale'
const SUMMARY_SCALE = 'summary_scale'
const GREY_DOT_SCALE = 'grey_dot_scale'
const UNKNOWN_SCALE = 'unknown_scale'
const ZERO_DOT_SCALE = 'zero_dot_scale'

const RAW_VALUES = 'raw_values'
const DATASET_VALUES = 'dataset_values'
const NON_ZERO_DATASET_VALUES = 'non_zero_dataset_values'
const SUMMARY_VALUE = 'summary_value'
const ZERO_VALUES = 'zero_values'
const MISSING_PLACEHOLDER_VALUES = 'missing_data'

const LEGEND_SYMBOL_TYPE = 'square'
export const NO_DATA_MESSAGE = 'no data'
export const DEFAULT_LEGEND_COLOR_COUNT = 6

const ZERO_BUCKET_LABEL = '0'

export interface HighestLowest {
  highest?: DemographicGroup
  lowest?: DemographicGroup
}

export const PHRMA_ADHERENCE_BREAKPOINTS = [60, 70, 75, 80, 85, 90]

const PHRMA_COLOR_SCALE_SPEC = {
  name: COLOR_SCALE,
  type: 'threshold',
  domain: PHRMA_ADHERENCE_BREAKPOINTS,
  range: [
    het.mapMedicareDarkest,
    het.mapMedicareDark,
    het.mapMedicareMid,
    het.mapMedicareLight,
    het.mapMedicareLighter,
    het.mapMedicareEvenLighter,
    het.mapMedicareLightest,
  ],
}

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
