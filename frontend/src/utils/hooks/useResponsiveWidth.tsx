import { useState, useRef, useEffect, type RefObject } from 'react'
import { debounce } from 'lodash'
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

  const forceUpdate = () => {
    setWidth((prevWidth) => prevWidth + 1)
  }

  useEffect(() => {
    const element = ref.current

<<<<<<< HEAD
    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth
        const amountChanged = Math.abs(newWidth - width)
        if (amountChanged > MAP_RESIZE_TOLERANCE) {
=======
    const handleResize = () => {
      if (element) {
        const newWidth = element.offsetWidth || defaultWidth
        if (newWidth !== width) {
>>>>>>> 15cc5644 (Fixing rendering issue in `useResponsiveWidth` hook (#2372))
          setWidth(newWidth)
        }
      }
    }, 30) // Adjust the debounce delay (in milliseconds) as needed

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
<<<<<<< HEAD
  }, [width])
=======
  }, [defaultWidth, width, forceUpdate])
>>>>>>> 15cc5644 (Fixing rendering issue in `useResponsiveWidth` hook (#2372))

  return [ref, width]
}
