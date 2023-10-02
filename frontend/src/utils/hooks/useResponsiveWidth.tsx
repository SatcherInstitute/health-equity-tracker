import { useState, useRef, useEffect, type RefObject } from 'react'
import { debounce } from 'lodash'
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0bf887a7 (Use `<SourcesHelpers>` (#2419))
import {
  INVISIBLE_PRELOAD_WIDTH,
  MAP_RESIZE_TOLERANCE,
} from '../../charts/mapGlobals'
<<<<<<< HEAD
=======
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))
=======
import { useMediaQuery, useTheme } from '@mui/material'
>>>>>>> 1e8ebf60 (Fix map, width hook, and e2e tests (#2411))
=======
import { useEstimateMapWidth } from './useEstimateMapWidth'
>>>>>>> a5a41202 (Fix rendering map (#2416))
=======
>>>>>>> 54681117 (Tweak map renders (#2417))
=======
>>>>>>> 0bf887a7 (Use `<SourcesHelpers>` (#2419))

/*
Allow visualizations to calculate their updated width when the window is resized / re-zoomed. This function is debounced to restrict how often the calculation is done. Also prevents them from rendering before the width has been established based on the ref
*/
<<<<<<< HEAD
<<<<<<< HEAD
export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(INVISIBLE_PRELOAD_WIDTH)
<<<<<<< HEAD
=======
export function useResponsiveWidth(
  defaultWidth?: number
): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(defaultWidth ?? 0)
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))
=======
export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {
<<<<<<< HEAD
  const widthEstimate = 1
  const [width, setWidth] = useState<number>(widthEstimate)
>>>>>>> 1e8ebf60 (Fix map, width hook, and e2e tests (#2411))
=======
  const [width, setWidth] = useState<number>(25)
>>>>>>> 642aa127 (Re-implement hook to guess map preload width (#2418))
=======
>>>>>>> 0bf887a7 (Use `<SourcesHelpers>` (#2419))
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  useEffect(() => {
    const element = ref.current

<<<<<<< HEAD
<<<<<<< HEAD
    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth
<<<<<<< HEAD
<<<<<<< HEAD
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
<<<<<<< HEAD
    }, 30) // Adjust the debounce delay (in milliseconds) as needed
=======
    }, 300) // Adjust the debounce delay (in milliseconds) as needed
>>>>>>> 1172b4e8 (Debounces `useResponsiveWidth` hook; prevent map from rendering until ready (#2410))
=======
    }, 30) // Adjust the debounce delay (in milliseconds) as needed
>>>>>>> a5a41202 (Fix rendering map (#2416))
=======

        // only resize if new map size is a little smaller or significantly larger
        if (newWidth - width > 50 || width - newWidth > 10)
          setWidth(newWidth - 10)
      }
    }, 50) // how many milliseconds to wait between re-calculations
>>>>>>> 54681117 (Tweak map renders (#2417))
=======
        const amountChanged = Math.abs(newWidth - width)
        if (amountChanged > MAP_RESIZE_TOLERANCE) {
          setWidth(newWidth)
        }
      }
    }, 30) // Adjust the debounce delay (in milliseconds) as needed
>>>>>>> 642aa127 (Re-implement hook to guess map preload width (#2418))

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
