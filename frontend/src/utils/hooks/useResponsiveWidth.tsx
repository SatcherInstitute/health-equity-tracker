import { useState, useRef, useEffect, type RefObject } from 'react'
import { debounce } from 'lodash'
import { useMediaQuery, useTheme } from '@mui/material'

/*
Allow visualizations to calculate their updated width when the window is resized / re-zoomed. This function is debounced to restrict how often the calculation is done. Also prevents them from rendering before the width has been established based on the ref
*/
export function useResponsiveWidth(
  defaultWidth?: number,
  doLogs?: boolean
): [RefObject<HTMLDivElement>, number] {
  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.down('md'))
  const isCompareMode = window.location.href.includes('compare')
  if (doLogs) console.log(window.innerWidth, { pageIsSmall }, { isCompareMode })
  let widthEstimateDivider = 1
  if (!pageIsSmall) widthEstimateDivider = 1.6
  if (isCompareMode) widthEstimateDivider = 2.6

  let widthEstimate = window.innerWidth / widthEstimateDivider
  if (widthEstimate > 1200) widthEstimate = isCompareMode ? 750 : 1200

  const [width, setWidth] = useState<number>(widthEstimate)
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  useEffect(() => {
    if (doLogs) console.log({ width })
  }, [width])

  useEffect(() => {
    const element = ref.current

    const handleResize = debounce(() => {
      if (element) {
        if (doLogs) console.log('element.offsetWidth', element.offsetWidth)
        const newWidth = element.offsetWidth ?? defaultWidth
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
