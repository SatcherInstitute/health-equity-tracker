/*
To prevent components loading from one another, all exported consts for the map cards should be in this file
*/
import type { DemographicGroup } from '../data/utils/Constants'
import type { Scale, ColorScheme, Legend } from 'vega'
import type { MapConfig, MetricConfig } from '../data/config/MetricConfig'
import { het } from '../styles/DesignTokens'

export const DATA_SUPPRESSED = 'Data suppressed'

export const MISSING_DATASET = 'MISSING_DATASET'
export const US_PROJECTION = 'US_PROJECTION'
export const CIRCLE_PROJECTION = 'CIRCLE_PROJECTION'
export const GEO_DATASET = 'GEO_DATASET'
export const VAR_DATASET = 'VAR_DATASET'
export const ZERO_VAR_DATASET = 'ZERO_VAR_DATASET'

export const VALID_DATASET = 'VALID_DATASET'
export const ZERO_DATASET = 'ZERO_DATASET'

export const COLOR_SCALE = 'COLOR_SCALE'
export const ZERO_SCALE = 'ZERO_SCALE'

export const LEGEND_DATASET = 'LEGEND_DATASET'

export type ScaleType = 'quantize' | 'quantile' | 'symlog'
export type StackingDirection = 'horizontal' | 'vertical'

export const RATE_MAP_SCALE: ScaleType = 'quantile'
export const UNKNOWNS_MAP_SCALE: ScaleType = 'symlog'

export const ORDINAL = 'ordinal'

export type PopulationSubset =
  | 'default'
  | 'women'
  | 'men'
  | 'medicare'
  | 'unknown'
  | 'youth'

export const MAP_SCHEMES: Record<PopulationSubset, ColorScheme> = {
  default: 'darkgreen',
  women: 'plasma',
  men: 'inferno',
  medicare: 'viridis',
  unknown: 'greenblue',
  youth: 'darkred',
}

export const defaultHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.default,
  min: het.mapDarkZero,
  mid: het.mapMid,
  higherIsBetter: true,
}

export const defaultHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.default,
  min: het.mapLightZero,
  mid: het.mapMid,
  higherIsBetter: false,
}

export const womenHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.women,
  min: het.mapWomenDarkZero,
  mid: het.mapWomenMid,
  higherIsBetter: true,
}

export const womenHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.women,
  min: het.mapWomenLightZero,
  mid: het.mapWomenMid,
  higherIsBetter: false,
}

export const menHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.men,
  min: het.mapLightZero,
  mid: het.mapMid,
  higherIsBetter: false,
}

export const medicareHigherIsBetterMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.medicare,
  min: het.mapMedicareDarkZero,
  mid: het.mapMedicareMid,
  higherIsBetter: true,
}

export const medicareHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.medicare,
  min: het.mapMedicareLightZero,
  mid: het.mapMedicareMid,
  higherIsBetter: false,
}

export const youthHigherIsWorseMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.youth,
  min: het.mapLightZero,
  mid: het.mapMid,
  higherIsBetter: false,
}

export const unknownMapConfig: MapConfig = {
  scheme: MAP_SCHEMES.unknown,
  min: het.unknownMapLeast,
  mid: het.unknownMapMid,
}

export const DOT_SIZE_SCALE = 'dot_size_scale'
export const SUMMARY_SCALE = 'summary_scale'
export const GREY_DOT_SCALE = 'grey_dot_scale'
export const UNKNOWN_SCALE = 'unknown_scale'
export const ZERO_DOT_SCALE = 'zero_dot_scale'

export const RAW_VALUES = 'raw_values'
export const DATASET_VALUES = 'dataset_values'
export const NON_ZERO_DATASET_VALUES = 'non_zero_dataset_values'
export const SUMMARY_VALUE = 'summary_value'
export const ZERO_VALUES = 'zero_values'
export const MISSING_PLACEHOLDER_VALUES = 'missing_data'

export const LEGEND_SYMBOL_TYPE = 'square'
export const LEGEND_TEXT_FONT = 'Inter Variable'
export const NO_DATA_MESSAGE = 'no data'
export const EQUAL_DOT_SIZE = 200
export const DEFAULT_LEGEND_COLOR_COUNT = 6

export const ZERO_BUCKET_LABEL = '0'

export interface HighestLowest {
  highest?: DemographicGroup
  lowest?: DemographicGroup
}

export const UNKNOWN_SCALE_SPEC: any = {
  name: UNKNOWN_SCALE,
  type: ORDINAL,
  domain: { data: MISSING_PLACEHOLDER_VALUES, field: 'missing' },
  range: [het.howToColor],
}

export const GREY_DOT_SCALE_SPEC: any = {
  name: GREY_DOT_SCALE,
  type: ORDINAL,
  domain: { data: 'missing_data', field: 'missing' },
  range: [EQUAL_DOT_SIZE],
}

export const ZERO_DOT_SCALE_SPEC: any = {
  name: ZERO_DOT_SCALE,
  type: ORDINAL,
  domain: [0, 0],
  range: [EQUAL_DOT_SIZE],
}

export const ZERO_LIGHT_SCALE = {
  name: ZERO_SCALE,
  type: 'ordinal',
  domain: [0],
  range: [het.mapLightZero],
}

export const ZERO_DARK_SCALE = {
  name: ZERO_SCALE,
  type: 'ordinal',
  domain: [0],
  range: [het.mapDarkZero],
}

export const PHRMA_ADHERENCE_BREAKPOINTS = [60, 70, 75, 80, 85, 90]

export const PHRMA_COLOR_SCALE_SPEC: Scale = {
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
export const UNKNOWN_LEGEND_SPEC: Legend = {
  fill: UNKNOWN_SCALE,
  symbolType: LEGEND_SYMBOL_TYPE,
  size: GREY_DOT_SCALE,
  orient: 'left',
}

export interface CountColsMap {
  numeratorConfig?: MetricConfig
  denominatorConfig?: MetricConfig
}

export const INVISIBLE_PRELOAD_WIDTH = 25
export const MAP_RESIZE_TOLERANCE = 15
