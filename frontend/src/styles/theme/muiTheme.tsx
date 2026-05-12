import { extendTheme } from '@mui/material/styles'
import { hetColors } from './colorValues'
import { het } from './colorVars'

// type augmentation
declare module '@mui/material/styles' {
  interface PaletteOptions {
    custom?: typeof hetColors
  }
  interface Palette {
    custom: typeof hetColors
  }
}

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

const muiTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: hetColors.barChartLight,
          main: hetColors.altGreen,
          dark: hetColors.darkGreen,
          contrastText: '#fff',
        },
        secondary: {
          light: hetColors.secondaryLight,
          main: hetColors.secondaryMain,
          dark: hetColors.secondaryDark,
        },
        background: {
          default: '#fff',
        },
        custom: hetColors,
      },
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
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-sans-text)',
          '&.MuiAlert-standardInfo': {
            backgroundColor: het.standardInfo,
            color: het.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: het.altGreen,
            },
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: het.standardWarning,
            color: het.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: het.alertColor,
            },
          },
          '&.MuiAlert-standardError': {
            textAlign: 'left',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        endAdornment: {
          top: 'inherit',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: 'var(--font-sans-text)',
          padding: 'unset',
          borderRadius: 'unset',
          minWidth: 'unset',
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
    MuiStepButton: {
      styleOverrides: {
        root: {
          padding: '0',
        },
        vertical: {
          margin: '0 auto',
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        vertical: {
          paddingBlock: '0',
          margin: '0 auto',
        },
        lineVertical: {
          minHeight: '8px',
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          lineHeight: '.95',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          marginBottom: '-4px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          // textTransform handled in index.css but kept here for MUI
          // specificity since Tab uses its own internal class stacking.
          textTransform: 'none',
          fontFamily: 'var(--font-sans-title) !important',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginTop: '40px',
          borderBottom: `1px solid ${het.borderColor}`,
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
    MuiToggleButton: {
      styleOverrides: {
        root: {
          outline: `1px solid ${het.howToColor} !important`,
          fontWeight: 'normal',
          fontSize: '14px',
          color: het.altBlack,
          lineHeight: '16px !important',
          padding: '11px !important',
          backgroundColor: '#fff !important',
          textTransform: 'none',
          '&.Mui-selected': {
            color: het.altGreen,
            backgroundColor: `${het.toggleColor} !important`,
          },
          '&:hover': {
            color: het.altGreen,
            backgroundColor: het.toggleColor,
          },
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

export default muiTheme
