import { useState, useRef, useEffect, type RefObject } from 'react'
import { debounce } from 'lodash'

/*
Allow visualizations to calculate their updated width when the window is resized / re-zoomed. This function is debounced to restrict how often the calculation is done. Also prevents them from rendering before the width has been established based on the ref
*/
export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {
  const widthEstimate = 1
  const [width, setWidth] = useState<number>(widthEstimate)
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  useEffect(() => {
    const element = ref.current

    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth

        // only resize if new map size is a little smaller or significantly larger
        if (newWidth - width > 50 || width - newWidth > 10)
          setWidth(newWidth - 10)
      }
    }, 50) // how many milliseconds to wait between re-calculations

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [width])

  return [ref, width]
}
