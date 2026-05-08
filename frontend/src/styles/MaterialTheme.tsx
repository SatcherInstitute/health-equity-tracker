import { createTheme } from '@mui/material'
import { het } from '../styles/DesignTokens'

/**
 * Color strategy:
 *
 * - Palette main/light/dark entries use hardcoded hex because MUI derives
 *   hover, focus, and ripple colors from these at theme-creation time via
 *   color manipulation functions that cannot resolve CSS variables.
 *
 * - Component styleOverrides use `het.*` (CSS variables) wherever the value
 *   is applied directly to a CSS property and no MUI derivation is needed.
 *
 * - Template literals that interpolate into a CSS string (e.g. borderBottom)
 *   also use `het.*` since the browser resolves those at paint time.
 */

const MaterialTheme = createTheme({
  palette: {
    primary: {
      light: '#91c684', // --color-bar-chart-light
      main: '#0b5240', // --color-alt-green
      dark: '#083f31', // --color-dark-green
      contrastText: '#fff',
    },
    secondary: {
      light: '#89d5cc', // --color-secondary-light
      main: '#228b7e', // --color-secondary-main
      dark: '#167b6f', // --color-secondary-dark
    },
    background: {
      default: het.hetWhite,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'var(--font-sans-text)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: 'var(--font-sans-text)',
        },
        containedPrimary: {
          color: '#fff',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        inputSizeSmall: {
          fontSize: 'var(--text-smallest)',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-sans-title)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: 'var(--font-sans-title) !important',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          outline: `1px solid ${het.howToColor} !important`,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-sans-title)',
        },
      },
    },
  },
})

export default MaterialTheme
