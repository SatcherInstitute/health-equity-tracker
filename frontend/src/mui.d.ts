import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      howTo: string
      toggle: string
      border: string
      info: string
      warning: string
      white: string
      black: string
    }
  }
  interface PaletteOptions {
    custom?: {
      howTo?: string
      toggle?: string
      border?: string
      info?: string
      warning?: string
      white?: string
      black?: string
    }
  }
}
