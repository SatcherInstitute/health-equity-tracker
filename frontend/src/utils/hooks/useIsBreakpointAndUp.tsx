import { useEffect, useState } from 'react'
import { resolveCssVar } from '../../styles/theme/themeUtils'

type TailwindBreakpoint =
  | 'xs'
  | 'tiny'
  | 'sm'
  | 'smplus'
  | 'md'
  | 'lg'
  | 'lgplus'
  | 'xl'

function getBreakpointValue(breakpoint: TailwindBreakpoint): number {
  const value = resolveCssVar(`--breakpoint-${breakpoint}`)
  return Number.parseInt(value.replace('px', ''), 10) || 0
}

export function useIsBreakpointAndUp(breakpoint: TailwindBreakpoint) {
  const [isBreakpoint, setIsBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= getBreakpointValue(breakpoint)
  })

  useEffect(() => {
    const handleResize = () => {
      setIsBreakpoint(window.innerWidth >= getBreakpointValue(breakpoint))
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isBreakpoint
}
