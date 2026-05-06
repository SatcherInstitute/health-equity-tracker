import { extendTheme } from '@mui/material'
import { het } from '../styles/DesignTokens'

const MaterialTheme = extendTheme({
  // This enables the CSS variables feature
  cssVarPrefix: 'mui',
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
        // Adding custom tokens here so MUI generates CSS variables for them
        background: {
          default: het.white,
        },
        custom: {
          howTo: het.howToColor,
          toggle: het.toggleColor,
          border: het.borderColor,
          info: het.standardInfo,
          warning: het.standardWarning,
          white: het.white,
          black: het.black,
        },
      },
    },
  },
  components: {
    // ... your existing component overrides
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", sans-serif',
          backgroundColor: 'var(--mui-palette-background-default)',
        },
      },
    },
  },
})

export default MaterialTheme
