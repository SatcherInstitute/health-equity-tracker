import { colors } from '../../styles/tokens/colors'

export const GEO_HOVERED_OPACITY = 0.5
export const GEO_HOVERED_BORDER_COLOR = colors.altWhite

export const GEO_HOVERED_BORDER_WIDTH = 2
export const STROKE_WIDTH = 0.5

// Small states where the tooltip shows a geographic mini-map for identification.
// CT, DE, DC, HI, NH, NJ, RI, VT
export const SMALL_STATE_FIPS = new Set([
  '09',
  '10',
  '11',
  '15',
  '33',
  '34',
  '44',
  '50',
])

// AK and HI render as geographic insets; their land pixels are tiny and
// water fills the inset area. A transparent bounding-box rect makes the
// entire inset (water + land) clickable and hoverable.
export const INSET_STATE_FIPS = new Set(['02', '15'])
