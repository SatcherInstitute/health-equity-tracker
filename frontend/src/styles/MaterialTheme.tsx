import { extendTheme } from '@mui/material'
import { het } from '../styles/DesignTokens'

// Use the new extendTheme function from MUI v7
const MaterialTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: het.barChartLight,
          main: het.altGreen,
          dark: het.darkGreen,
        },
        secondary: {
          light: het.secondaryLight,
          main: het.secondaryMain,
          dark: het.secondaryDark,
        },
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          '&.MuiAlert-standardInfo': {
            backgroundColor: het.standardInfo,
            color: het.black,
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: het.altGreen,
            },
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: het.standardWarning,
            color: het.black,
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
    MuiButtonBase: {
      styleOverrides: {},
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: '"Inter", sans-serif',
        },
        containedPrimary: {
          color: het.white,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        inputSizeSmall: {
          fontSize: '.75rem',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
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
          textTransform: 'none',
          fontFamily: '"DM Sans", sans-serif !important',
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
          borderRadius: '4px',
          overflow: 'hidden',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          outline: `1px solid ${het.howToColor} !important`,
          fontWeight: 'normal',
          fontSize: '14px',
          color: het.black,
          lineHeight: '16px !important',
          padding: '11px !important',
          backgroundColor: `${het.white} !important`,
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
  },
})

export default MaterialTheme
