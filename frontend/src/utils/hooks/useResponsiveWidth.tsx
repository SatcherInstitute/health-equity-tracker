import debounce from 'just-debounce-it'
import { type RefObject, useEffect, useRef, useState } from 'react'
import {
  INVISIBLE_PRELOAD_WIDTH,
  MAP_RESIZE_TOLERANCE,
} from '../../charts/mapGlobals'

/*
Allow visualizations to calculate their updated width when the window is resized / re-zoomed. This function is debounced to restrict how often the calculation is done. Also prevents them from rendering before the width has been established based on the ref
*/
export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(INVISIBLE_PRELOAD_WIDTH)
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  useEffect(() => {
    const element = ref.current

    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth
        const amountChanged = Math.abs(newWidth - width)
        if (amountChanged > MAP_RESIZE_TOLERANCE) {
          setWidth(newWidth)
        }
      }
    }, 30) // Adjust the debounce delay (in milliseconds) as needed

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [width])

  return [ref, width]
}
