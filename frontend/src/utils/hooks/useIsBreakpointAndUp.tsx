import { useEffect, useState } from 'react'

type TailwindBreakpoint =
  | 'xs'
  | 'tiny'
  | 'sm'
  | 'smplus'
  | 'md'
  | 'lg'
  | 'lgplus'
  | 'xl'

// TODO: source these from tokens/dimensions.tokens.json via dimensionValues
const BREAKPOINTS: Record<TailwindBreakpoint, number> = {
  xs: 0,
  tiny: 350,
  sm: 600,
  smplus: 768,
  md: 960,
  lg: 1280,
  lgplus: 1440,
  xl: 1920,
}

export function useIsBreakpointAndUp(breakpoint: TailwindBreakpoint) {
  const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`
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
