import { useMediaQuery, useTheme } from '@mui/material'
import {
  MULTIPLE_MAPS_1_PARAM_KEY,
  MULTIPLE_MAPS_2_PARAM_KEY,
} from '../urlutils'
import { useGetParamState } from './useParamState'

export function useEstimateMapWidth() {
  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.down('md'))
  const pageIsXL = useMediaQuery(theme.breakpoints.up('xl'))

  const extraSpace = pageIsSmall ? 25 : 100
  const windowWidth = window.innerWidth - extraSpace // available width accounting for modal / margins / padding

  //  handle multimap first
  const multiMap1IsOpen = useGetParamState(MULTIPLE_MAPS_1_PARAM_KEY)
  const multiMap2IsOpen = useGetParamState(MULTIPLE_MAPS_2_PARAM_KEY)
  if (multiMap1IsOpen || multiMap2IsOpen)
    return pageIsSmall ? windowWidth / 2 : windowWidth / 4.5

  const isCompareMode = window.location.href.includes('compare')
  let widthEstimateDivider = 0.1
  if (!pageIsSmall) widthEstimateDivider = 1.8
  if (isCompareMode && !pageIsSmall) widthEstimateDivider = 2.6

  let widthEstimate
  if (pageIsXL) {
    widthEstimate = isCompareMode ? 750 : 1200
  } else {
    widthEstimate = window.innerWidth / widthEstimateDivider
  }

  return widthEstimate
}
