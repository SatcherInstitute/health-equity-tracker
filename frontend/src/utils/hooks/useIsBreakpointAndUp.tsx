import { useEffect, useState } from 'react'
import { ThemeStandardScreenSizes } from '../../styles/DesignTokens'

// Create a type from your screen sizes
type TailwindBreakpoint = keyof typeof ThemeStandardScreenSizes

function getTailwindBreakpointValue(breakpoint: TailwindBreakpoint): number {
  const breakpointStringValue = ThemeStandardScreenSizes[breakpoint]

  // Handle different units
  if (breakpointStringValue === 'full') return Number.POSITIVE_INFINITY
  if (breakpointStringValue.includes('vw')) {
    // For viewport width units like '80vw', calculate based on current viewport
    const vwValue = Number.parseInt(breakpointStringValue.replace('vw', ''))
    return (window.innerWidth * vwValue) / 100
  }

  // Handle px values
  const pixelValue = Number.parseInt(breakpointStringValue.replace('px', ''))
  return pixelValue || 0
}

export function useIsBreakpointAndUp(breakpoint: TailwindBreakpoint) {
  const [isBreakpoint, setIsBreakpoint] = useState(() => {
    // Safe initialization that works on server-side rendering
    if (typeof window === 'undefined') return false
    return window.innerWidth >= getTailwindBreakpointValue(breakpoint)
  })

  useEffect(() => {
    const handleResize = () => {
      setIsBreakpoint(
        window.innerWidth >= getTailwindBreakpointValue(breakpoint),
      )
    }

    // Set initial value
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint])

  return isBreakpoint
}
