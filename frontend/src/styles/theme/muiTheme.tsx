import { extendTheme } from '@mui/material/styles'
import { colorValues } from '../tokens/colors'
import { dimensionValues } from '../tokens/dimensions'
import { typographyValues } from '../tokens/typography'

// Palette entries use hex (from generated colorValues.ts) because MUI derives
// hover, focus, and ripple colors at theme-creation time via color functions
// that cannot resolve CSS variables. Component styleOverrides use colorValues.* (CSS
// variables) for direct property application — the browser resolves these at
// paint time. Our custom color tokens live in colorValues.css independently of
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
          fontFamily: typographyValues.fontSansText,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: typographyValues.fontSansText,
          '&.MuiAlert-standard.MuiAlert-colorInfo': {
            backgroundColor: colorValues.standardInfo,
            color: colorValues.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: colorValues.altGreen,
            },
          },
          '&.MuiAlert-standard.MuiAlert-colorWarning': {
            backgroundColor: colorValues.standardWarning,
            color: colorValues.altBlack,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: colorValues.alertColor,
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
          fontFamily: typographyValues.fontSansText,
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
            fontSize: typographyValues.textSmallest,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          fontFamily: typographyValues.fontSansTitle,
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
          lineHeight: typographyValues.leadingTight,
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
          fontFamily: `${typographyValues.fontSansTitle} !important`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginTop: '40px',
          borderBottom: `1px solid ${colorValues.borderColor}`,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          outline: `1px solid ${colorValues.howToColor} !important`,
          borderRadius: dimensionValues.radiusSm,
          overflow: 'hidden',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          outline: `1px solid ${colorValues.howToColor} !important`,
          fontWeight: 'normal',
          fontSize: '14px',
          color: colorValues.altBlack,
          lineHeight: '16px !important',
          padding: '11px !important',
          backgroundColor: '#fff !important',
          textTransform: 'none',
          '&.Mui-selected': {
            color: colorValues.altGreen,
            backgroundColor: `${colorValues.toggleColor} !important`,
          },
          '&:hover': {
            color: colorValues.altGreen,
            backgroundColor: colorValues.toggleColor,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: typographyValues.fontSansTitle,
        },
      },
    },
  },
})

export default muiTheme
