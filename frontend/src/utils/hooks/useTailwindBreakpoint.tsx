/*
This hook should really load breakpoint keys and values from tailwind config dynamically rather than having them hard-coded and needed to be manually kept in sync

      xs: '0px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1920px',
*/
import { useState, useEffect } from 'react'

// Define string union type for Tailwind breakpoints
type TailwindBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Function to convert Tailwind breakpoint to pixel value
function getBreakpointValue(breakpoint: TailwindBreakpoint): string {
  switch (breakpoint) {
    case 'xs':
      return '0px'
    case 'sm':
      return '600px'
    case 'md':
      return '960px'
    case 'lg':
      return '1280px'
    case 'xl':
      return '1920px'
    default:
      throw new Error('Invalid breakpoint')
  }
}

export function useTailwindBreakpoint(breakpoint: TailwindBreakpoint) {
  const [isBreakpoint, setIsBreakpoint] = useState(
    window.innerWidth >=
      parseInt(getBreakpointValue(breakpoint).replace('px', ''))
  )

  useEffect(() => {
    const handleResize = () => {
      setIsBreakpoint(
        window.innerWidth >=
          parseInt(getBreakpointValue(breakpoint).replace('px', ''))
      )
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint])

  return isBreakpoint
}
