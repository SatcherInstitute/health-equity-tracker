import { useEffect, useState } from 'react'
import {
  type Breakpoint,
  breakpointValues,
} from '../../styles/tokens/dimensions'

export function useIsBreakpointAndUp(breakpoint: Breakpoint) {
  const query = `(min-width: ${breakpointValues[breakpoint]})`
  const [isBreakpoint, setIsBreakpoint] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setIsBreakpoint(e.matches)
    setIsBreakpoint(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handler)
    return () => mediaQueryList.removeEventListener('change', handler)
  }, [query])

  return isBreakpoint
}
