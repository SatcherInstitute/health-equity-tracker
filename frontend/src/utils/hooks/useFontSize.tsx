import { useEffect, useState } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'

export function useFontSize() {
  const theme = useTheme()
  const isComparing = window.location.href.includes('compare')
  const isSmall = useMediaQuery(theme.breakpoints.only('sm'))
  const [fontSize, setFontsize] = useState(18)

  // we need to implement useEffect to rerender so that Vega will draw the title correctly
  useEffect(() => {
    if (isComparing && isSmall) {
      setFontsize(12)
    } else {
      setFontsize(18)
    }
  }, [isComparing, fontSize, isSmall])

  return fontSize
}
