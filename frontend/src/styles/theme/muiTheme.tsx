import { extendTheme } from '@mui/material/styles'
import { hetColors } from './colorValues'
import { het } from './colorVars'

// Palette entries use hex (from generated colorValues.ts) because MUI derives
// hover, focus, and ripple colors at theme-creation time via color functions
// that cannot resolve CSS variables. Component styleOverrides use het.* (CSS
// variables) for direct property application — the browser resolves these at
// paint time. Our custom color tokens live in colorVars.css independently of
// MUI's --mui-palette-* variables.
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
          '&.MuiAlert-standard.MuiAlert-colorInfo': {
            backgroundColor: het.standardInfo,
            color: het.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: het.altGreen,
            },
          },
          '&.MuiAlert-standard.MuiAlert-colorWarning': {
            backgroundColor: het.standardWarning,
            color: het.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: het.alertColor,
            },
          },
          '&.MuiAlert-standard.MuiAlert-colorError': {
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
        sizeSmall: {
          '& .MuiInputBase-input': {
            fontSize: 'var(--text-smallest)',
          },
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
        line: {
          variants: [
            {
              props: { orientation: 'vertical' },
              style: {
                minHeight: '8px',
              },
            },
          ],
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
