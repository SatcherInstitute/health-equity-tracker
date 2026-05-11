import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      altBlack: string
    }
  }
  interface PaletteOptions {
    custom?: {
      altBlack?: string
    }
  }
}
