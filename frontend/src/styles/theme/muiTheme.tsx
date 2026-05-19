import { extendTheme } from '@mui/material/styles'
import { colors } from '../tokens/colors'
import { dimensions } from '../tokens/dimensions'
import { typography } from '../tokens/typography'

// Palette entries use hex (from generated colors.ts) because MUI derives
// hover, focus, and ripple colors at theme-creation time via color functions
// that cannot resolve CSS variables. Component styleOverrides use colors.* (CSS
// variables) for direct property application — the browser resolves these at
// paint time. Our custom color tokens live in colors.css independently of
// MUI's --mui-palette-* variables.
const muiTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: colors.barChartLight,
          main: colors.altGreen,
          dark: colors.darkGreen,
          contrastText: '#fff',
        },
        secondary: {
          light: colors.secondaryLight,
          main: colors.secondaryMain,
          dark: colors.secondaryDark,
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
          fontFamily: typography.fontSansText,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontSansText,
          '&.MuiAlert-standard.MuiAlert-colorInfo': {
            backgroundColor: colors.standardInfo,
            color: colors.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: colors.altGreen,
            },
          },
          '&.MuiAlert-standard.MuiAlert-colorWarning': {
            backgroundColor: colors.standardWarning,
            color: colors.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: colors.alertColor,
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
          fontFamily: typography.fontSansText,
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
            fontSize: typography.textSmallest,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontSansTitle,
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
          lineHeight: typography.leadingTight,
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
          fontFamily: `${typography.fontSansTitle} !important`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginTop: '40px',
          borderBottom: `1px solid ${colors.borderColor}`,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          outline: `1px solid ${colors.howToColor} !important`,
          borderRadius: dimensions.radiusSm,
          overflow: 'hidden',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          outline: `1px solid ${colors.howToColor} !important`,
          fontWeight: 'normal',
          fontSize: '14px',
          color: colors.altBlack,
          lineHeight: '16px !important',
          padding: '11px !important',
          backgroundColor: '#fff !important',
          textTransform: 'none',
          '&.Mui-selected': {
            color: colors.altGreen,
            backgroundColor: `${colors.toggleColor} !important`,
          },
          '&:hover': {
            color: colors.altGreen,
            backgroundColor: colors.toggleColor,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontSansTitle,
        },
      },
    },
  },
})

export default muiTheme
