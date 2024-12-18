import { createTheme } from '@mui/material/styles'
import { ThemeLineHeightValues, het } from '../styles/DesignTokens'

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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", sans-serif',
        },
        '.MuiAlert-standardInfo .MuiAlert-icon': {
          color: `${het.altGreen} !important`,
        },
        '.MuiAlert-standardWarning .MuiAlert-icon': {
          color: `${het.alertColor} !important`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
        },
        standardInfo: {
          backgroundColor: `${het.standardInfo} !important`,
          color: `${het.black} !important`,
          textAlign: 'left',
        },
        standardWarning: {
          backgroundColor: `${het.standardWarning} !important`,
          color: `${het.black} !important`,
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
          lineHeight: ThemeLineHeightValues.lhTight,
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
