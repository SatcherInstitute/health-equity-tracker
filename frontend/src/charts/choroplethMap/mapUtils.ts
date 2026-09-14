import { colors } from '../../styles/tokens/colors'

export const GEO_HOVERED_OPACITY = 0.5
export const GEO_HOVERED_BORDER_COLOR = colors.altWhite
export const GEO_HOVERED_FILTER = 'drop-shadow(0 0 2px rgba(0,0,0,0.25))'

export const GEO_HOVERED_BORDER_WIDTH = 2
export const STROKE_WIDTH = 0.5

// Thick transparent stroke on coastline-only ghost paths extends the pointer
// hit area into adjacent water without overlapping shared inland borders.
export const GHOST_STROKE_WIDTH = 20

// AK and HI render as geographic insets; their land pixels are tiny and
// water fills the inset area. A transparent bounding-box rect makes the
// entire inset (water + land) clickable and hoverable.
export const INSET_STATE_FIPS = new Set(['02', '15'])
