/*
This hook should really load breakpoint keys and values from tailwind config dynamically rather than having them hard-coded and needed to be manually kept in sync

      xs: '0px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1920px',
*/
import { useState, useEffect } from 'react'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig)

// Define string union type for Tailwind breakpoints
type TailwindBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

function getTailwindBreakpointValue(breakpoint: TailwindBreakpoint): number {
  const pixelBreakpoint = fullConfig?.theme?.screens?.[breakpoint]

  const pixelValue = parseInt(pixelBreakpoint.replace('px', ''))

  return pixelValue || 0
}

export function useTailwindBreakpoint(breakpoint: TailwindBreakpoint) {
  const [isBreakpoint, setIsBreakpoint] = useState(
    window.innerWidth >= getTailwindBreakpointValue(breakpoint)
  )

  useEffect(() => {
    const handleResize = () => {
      setIsBreakpoint(
        window.innerWidth >= getTailwindBreakpointValue(breakpoint)
      )
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint])

  return isBreakpoint
}
