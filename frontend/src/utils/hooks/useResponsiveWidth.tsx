import { useState, useRef, useEffect, type RefObject } from 'react'
import debounce from 'lodash/debounce'

export function useResponsiveWidth(
  defaultWidth?: number
): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(defaultWidth ?? 0)
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  useEffect(() => {
    const element = ref.current

    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth ?? defaultWidth ?? 0
        if (newWidth !== width) {
          setWidth(newWidth)
        }
      }
    }, 300) // Adjust the debounce delay (in milliseconds) as needed

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [defaultWidth, width])

  return [ref, width]
}
