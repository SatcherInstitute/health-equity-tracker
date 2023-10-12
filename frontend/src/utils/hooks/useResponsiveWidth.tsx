import { useState, useRef, useEffect, type RefObject } from 'react'
import { debounce } from 'lodash'




import {
  INVISIBLE_PRELOAD_WIDTH,
  MAP_RESIZE_TOLERANCE,
} from '../../charts/mapGlobals'

import { useMediaQuery, useTheme } from '@mui/material'

import { useEstimateMapWidth } from './useEstimateMapWidth'

/*
Allow visualizations to calculate their updated width when the window is resized / re-zoomed. This function is debounced to restrict how often the calculation is done. Also prevents them from rendering before the width has been established based on the ref
*/


export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(INVISIBLE_PRELOAD_WIDTH)
export function useResponsiveWidth(
  defaultWidth?: number
): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(defaultWidth ?? 0)

export function useResponsiveWidth(): [RefObject<HTMLDivElement>, number] {

  const widthEstimate = 1
  const [width, setWidth] = useState<number>(widthEstimate)

  const [width, setWidth] = useState<number>(25)

  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  useEffect(() => {
    const element = ref.current



    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth


    const handleResize = () => {

    const handleResize = debounce(() => {
      if (element) {
        const newWidth = element.offsetWidth ?? defaultWidth ?? 0

        if (newWidth !== width) {

          setWidth(newWidth)
        }
      }

    }, 300) // Adjust the debounce delay (in milliseconds) as needed

    }, 30) // Adjust the debounce delay (in milliseconds) as needed


        // only resize if new map size is a little smaller or significantly larger
        if (newWidth - width > 50 || width - newWidth > 10)
          setWidth(newWidth - 10)
      }
    }, 50) // how many milliseconds to wait between re-calculations


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


  }, [defaultWidth, width, forceUpdate])

  }, [defaultWidth, width])


  }, [width])


  return [ref, width]
}
