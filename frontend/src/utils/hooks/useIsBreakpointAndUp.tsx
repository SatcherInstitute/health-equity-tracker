import { useEffect, useState } from 'react'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig)
type TailwindBreakpoint = keyof typeof fullConfig.theme.screens

export function getTailwindBreakpointValue(
  breakpoint: TailwindBreakpoint,
): number {
  const breakpointStringValue = fullConfig.theme.screens[breakpoint]
  const pixelValue = Number.parseInt(breakpointStringValue.replace('px', ''))
  return pixelValue || 0
}

export function useIsBreakpointAndUp(breakpoint: TailwindBreakpoint) {
  const [isBreakpoint, setIsBreakpoint] = useState(
    window.innerWidth >= getTailwindBreakpointValue(breakpoint),
  )

  useEffect(() => {
    const handleResize = () => {
      setIsBreakpoint(
        window.innerWidth >= getTailwindBreakpointValue(breakpoint),
      )
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint])

  return isBreakpoint
}

export function valueIsBreakpointAndUp(
  value: number,
  breakpoint: TailwindBreakpoint,
): boolean {
  return value >= getTailwindBreakpointValue(breakpoint)
}
