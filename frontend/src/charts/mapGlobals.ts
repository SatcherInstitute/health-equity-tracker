/*
To prevent components loading from one another, all exported consts for the map cards should be in this file
*/
import sass from '../styles/variables.module.scss'
import { type DemographicGroup } from '../data/utils/Constants'
<<<<<<< HEAD
import { type Scale, type ColorScheme, type Legend } from 'vega'
import { type MetricConfig } from '../data/config/MetricConfig'
=======
import { type ColorScheme } from 'vega'
>>>>>>> d419ca54 (Frontend: RF map color handling (#2391))

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

export type PopulationSubset = 'default' | 'women' | 'medicare' | 'unknown'

export const MAP_SCHEMES: Record<PopulationSubset, ColorScheme> = {
  default: 'darkgreen',
  women: 'plasma',
  medicare: 'viridis',
  unknown: 'greenblue',
}

export const womenMapConfig = {
  scheme: MAP_SCHEMES.women,
  min: sass.mapWomenMin,
  mid: sass.mapWomenMid,
}

export const medicareMapConfig = {
  scheme: MAP_SCHEMES.medicare,
  min: sass.mapMedicareMin,
  mid: sass.mapMedicareMid,
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
export const LEGEND_TEXT_FONT = 'inter'
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
  range: [sass.unknownGrey],
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

export const ZERO_YELLOW_SCALE = {
  name: ZERO_SCALE,
  type: 'ordinal',
  domain: [0],
  range: [sass.mapMin],
}

export const PHRMA_ADHERENCE_BREAKPOINTS = [60, 70, 75, 80, 85, 90]

export const PHRMA_COLOR_SCALE_SPEC: Scale = {
  name: COLOR_SCALE,
  type: 'threshold',
  domain: PHRMA_ADHERENCE_BREAKPOINTS,
  range: [
    sass.mapMedicareDarkest,
    sass.mapMedicareDark,
    sass.mapMedicareMid,
    sass.mapMedicareLight,
    sass.mapMedicareLighter,
    sass.mapMedicareEvenLighter,
    sass.mapMedicareLightest,
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
