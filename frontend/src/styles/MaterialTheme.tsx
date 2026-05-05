import { extendTheme } from '@mui/material'

// Use the new extendTheme function from MUI v7
const MaterialTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: 'var(--color-bar-chart-light)',
          main: 'var(--color-alt-green)',
          dark: 'var(--color-dark-green)',
        },
        secondary: {
          light: 'var(--color-secondary-light)',
          main: 'var(--color-secondary-main)',
          dark: 'var(--color-secondary-dark)',
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
            backgroundColor: 'var(--color-standard-info)',
            color: 'var(--color-black)',
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: 'var(--color-alt-green)',
            },
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: 'var(--color-standard-warning)',
            color: 'var(--color-black)',
            textAlign: 'left',
            '& .MuiAlert-icon': {
              color: 'var(--color-alert-color)',
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
          color: 'var(--color-white)',
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
          borderBottom: '1px solid var(--color-border)',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          outline: '1px solid var(--color-how-to-color) !important',
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
          outline: '1px solid var(--color-how-to-color) !important',
          fontWeight: 'normal',
          fontSize: '14px',
          color: 'var(--color-black)',
          lineHeight: '16px !important',
          padding: '11px !important',
          backgroundColor: 'var(--color-white) !important',
          textTransform: 'none',
          '&.Mui-selected': {
            color: 'var(--color-alt-green)',
            backgroundColor: 'var(--color-toggle-color) !important',
          },
          '&:hover': {
            color: 'var(--color-alt-green)',
            backgroundColor: 'var(--color-toggle-color)',
          },
        },
      },
    },
  },
})

export default MaterialTheme
