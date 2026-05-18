import { extendTheme } from '@mui/material/styles'
import { colorValues, colorVars } from '../tokens/colors'
import { dimensionVars } from '../tokens/dimensions'
import { typographyVars } from '../tokens/typography'

// Palette entries use hex (from generated colorValues.ts) because MUI derives
// hover, focus, and ripple colors at theme-creation time via color functions
// that cannot resolve CSS variables. Component styleOverrides use colorVars.* (CSS
// variables) for direct property application — the browser resolves these at
// paint time. Our custom color tokens live in colorVars.css independently of
// MUI's --mui-palette-* variables.
const muiTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: colorValues.barChartLight,
          main: colorValues.altGreen,
          dark: colorValues.darkGreen,
          contrastText: '#fff',
        },
        secondary: {
          light: colorValues.secondaryLight,
          main: colorValues.secondaryMain,
          dark: colorValues.secondaryDark,
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
          fontFamily: typographyVars.fontSansText,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: typographyVars.fontSansText,
          '&.MuiAlert-standard.MuiAlert-colorInfo': {
            backgroundColor: colorVars.standardInfo,
            color: colorVars.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: colorVars.altGreen,
            },
          },
          '&.MuiAlert-standard.MuiAlert-colorWarning': {
            backgroundColor: colorVars.standardWarning,
            color: colorVars.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: colorVars.alertColor,
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
          fontFamily: typographyVars.fontSansText,
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
            fontSize: typographyVars.textSmallest,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          fontFamily: typographyVars.fontSansTitle,
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
          lineHeight: typographyVars.leadingTight,
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
          fontFamily: `${typographyVars.fontSansTitle} !important`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginTop: '40px',
          borderBottom: `1px solid ${colorVars.borderColor}`,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          outline: `1px solid ${colorVars.howToColor} !important`,
          borderRadius: dimensionVars.radiusSm,
          overflow: 'hidden',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          outline: `1px solid ${colorVars.howToColor} !important`,
          fontWeight: 'normal',
          fontSize: '14px',
          color: colorVars.altBlack,
          lineHeight: '16px !important',
          padding: '11px !important',
          backgroundColor: '#fff !important',
          textTransform: 'none',
          '&.Mui-selected': {
            color: colorVars.altGreen,
            backgroundColor: `${colorVars.toggleColor} !important`,
          },
          '&:hover': {
            color: colorVars.altGreen,
            backgroundColor: colorVars.toggleColor,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: typographyVars.fontSansTitle,
        },
      },
    },
  },
})

export default muiTheme
