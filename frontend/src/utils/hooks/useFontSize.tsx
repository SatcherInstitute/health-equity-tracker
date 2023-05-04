import { useEffect, useState } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import sass from '../../styles/variables.module.scss'

export function useFontSize() {
  const theme = useTheme()
  const isComparing = window.location.href.includes('compare')
  const isSmall = useMediaQuery(theme.breakpoints.only('sm'))
  const [fontSize, setFontsize] = useState(parseInt(sass.vegaLargeTitle))

  // we need to implement useEffect to rerender so that Vega will draw the title correctly
  useEffect(() => {
    if (isComparing && isSmall) {
      setFontsize(parseInt(sass.vegaSmallTitle))
    } else {
      setFontsize(parseInt(sass.vegaLargeTitle))
    }
  }, [isComparing, fontSize, isSmall])

  return fontSize
}
