import { useState, useRef, useEffect, type RefObject } from 'react'
import { debounce } from 'lodash'

/*
Allow visualizations to calculate their updated width when the window is resized / re-zoomed. This function is debounced to restrict how often the calculation is done. Also prevents them from rendering before the width has been established based on the ref
*/
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
