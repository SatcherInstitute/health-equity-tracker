import { useState, useRef, useEffect, type RefObject } from 'react'
import { debounce } from 'lodash'
<<<<<<< HEAD
<<<<<<< HEAD
import {
  INVISIBLE_PRELOAD_WIDTH,
  MAP_RESIZE_TOLERANCE,
} from '../../charts/mapGlobals'
=======
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))
=======
import { useMediaQuery, useTheme } from '@mui/material'
>>>>>>> 1e8ebf60 (Fix map, width hook, and e2e tests (#2411))

/*
Allow visualizations to calculate their updated width when the window is resized / re-zoomed. This function is debounced to restrict how often the calculation is done. Also prevents them from rendering before the width has been established based on the ref
*/
<<<<<<< HEAD
<<<<<<< HEAD
export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(INVISIBLE_PRELOAD_WIDTH)
=======
export function useResponsiveWidth(
  defaultWidth?: number
): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(defaultWidth ?? 0)
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))
=======
export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {
  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.down('md'))
  const isCompareMode = window.location.href.includes('compare')
  let widthEstimateDivider = 1
  if (!pageIsSmall) widthEstimateDivider = 1.6
  if (isCompareMode) widthEstimateDivider = 2.6

  let widthEstimate = window.innerWidth / widthEstimateDivider
  if (widthEstimate > 1200) widthEstimate = isCompareMode ? 750 : 1200

  const [width, setWidth] = useState<number>(widthEstimate)
>>>>>>> 1e8ebf60 (Fix map, width hook, and e2e tests (#2411))
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  useEffect(() => {
    const element = ref.current

<<<<<<< HEAD
<<<<<<< HEAD
    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth
<<<<<<< HEAD
        const amountChanged = Math.abs(newWidth - width)
        if (amountChanged > MAP_RESIZE_TOLERANCE) {
=======
    const handleResize = () => {
=======
    const handleResize = debounce(() => {
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))
      if (element) {
        const newWidth = element.offsetWidth ?? defaultWidth ?? 0
=======
>>>>>>> 1e8ebf60 (Fix map, width hook, and e2e tests (#2411))
        if (newWidth !== width) {
>>>>>>> 15cc5644 (Fixing rendering issue in `useResponsiveWidth` hook (#2372))
          setWidth(newWidth)
        }
      }
<<<<<<< HEAD
    }, 30) // Adjust the debounce delay (in milliseconds) as needed
=======
    }, 300) // Adjust the debounce delay (in milliseconds) as needed
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  }, [width])
=======
  }, [defaultWidth, width, forceUpdate])
>>>>>>> 15cc5644 (Fixing rendering issue in `useResponsiveWidth` hook (#2372))
=======
  }, [defaultWidth, width])
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))
=======
  }, [width])
>>>>>>> 1e8ebf60 (Fix map, width hook, and e2e tests (#2411))

  return [ref, width]
}
