import { useEffect, useState } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'

export function useFontSize() {
  const theme = useTheme()
  const isComparing = window.location.href.includes('compare')
  const isSmall = useMediaQuery(theme.breakpoints.only('sm'))
  const [fontSize, setFontsize] = useState(14)

  useEffect(() => {
    if (isComparing && isSmall) {
      setFontsize(10)
    } else {
      setFontsize(14)
    }
  }, [isComparing, fontSize, isSmall])

  return fontSize
}
