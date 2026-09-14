import { colors } from '../../styles/tokens/colors'

export const GEO_HOVERED_OPACITY = 0.5
export const GEO_HOVERED_BORDER_COLOR = colors.altWhite

export const GEO_HOVERED_BORDER_WIDTH = 2
export const STROKE_WIDTH = 0.5

// States whose national-map shape is too small to click/tap reliably or identify at a glance.
// CT, DE, DC, HI, MD, MA, NH, NJ, RI, VT
export const SMALL_STATE_FIPS = new Set([
  '09',
  '10',
  '11',
  '15',
  '24',
  '25',
  '33',
  '34',
  '44',
  '50',
])

// Minimum pointer/touch target radius for small-state hit-area overlays
export const HIT_AREA_RADIUS = 20
