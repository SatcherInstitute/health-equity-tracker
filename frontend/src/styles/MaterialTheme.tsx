import { createTheme } from '@mui/material/styles'
import 'typeface-dm-sans'
import sass from './variables.module.scss'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    // Normal Breakpoints
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    // Custom breakpoints for useChartTitle, useFont
    titleXs: true
    titleSm: true
    titleMd: true
    titleLg: true
    titleXl: true
  }
}

const MaterialTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
      titleXs: 0,
      titleSm: 800,
      titleMd: 900,
      titleLg: 1500,
      titleXl: 1850,
    },
  },
  palette: {
    primary: {
      light: sass.barChartLight,
      main: sass.altGreen,
      dark: sass.darkGreen,
    },
    secondary: {
      light: sass.secondaryLight,
      main: sass.secondaryMain,
      dark: sass.secondaryDark,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", sans-serif',
        },
        '.MuiAlert-standardInfo .MuiAlert-icon': {
          color: `${sass.altGreen} !important`,
        },
        '.MuiAlert-standardWarning .MuiAlert-icon': {
          color: `${sass.alertColor} !important`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
        },
        standardInfo: {
          backgroundColor: `${sass.standardInfo} !important`,
          color: `${sass.black} !important`,
          textAlign: 'left',
        },
        standardWarning: {
          backgroundColor: `${sass.standardWarning} !important`,
          color: `${sass.black} !important`,
          textAlign: 'left',
        },
        standardError: {
          textAlign: 'left',
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
          color: sass.white,
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
          lineHeight: sass.lhTight,
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
          borderBottom: `1px solid ${sass.borderColor}`,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          outline: `1px solid ${sass.unknownGrey} !important`,
          borderRadius: '4px',
          overflow: 'hidden',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          outline: `1px solid ${sass.unknownGrey} !important`,
          fontWeight: 'normal',
          fontSize: '14px',
          color: sass.black,
          lineHeight: '16px !important',
          padding: '11px !important',
          backgroundColor: `${sass.white} !important`,
          textTransform: 'none',
          '&.Mui-selected': {
            color: sass.altGreen,
            backgroundColor: `${sass.toggleColor} !important`,
          },
          '&:hover': {
            color: sass.altGreen,
            backgroundColor: sass.toggleColor,
          },
        },
      },
    },
  },
})

export default MaterialTheme
