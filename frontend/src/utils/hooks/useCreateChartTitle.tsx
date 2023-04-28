import { useMediaQuery, useTheme } from '@mui/material'
import { type MetricConfig } from '../../data/config/MetricConfig'

interface ScreenDimensions {
  isMobile: boolean
  isSmall: boolean
  isNotLarge: boolean
  isLarge: boolean
  isComparing: boolean
}

type ScreenSize = 'small' | 'medium' | 'large'

export function createTitle(
  chartTitleLines: string[],
  location: string,
  screenSize: ScreenSize
) {
  if (screenSize === 'small') {
    return [...chartTitleLines, location]
  }
  if (screenSize === 'medium') {
    return [chartTitleLines.join(' '), location]
  }
  return [chartTitleLines.join(' '), location].join(' ')
}

function determineScreenSize(screenDimensions: ScreenDimensions) {
  if (
    screenDimensions.isMobile ||
    (screenDimensions.isComparing && screenDimensions.isNotLarge)
  ) {
    return 'small'
  }
  if (
    screenDimensions.isSmall ||
    (screenDimensions.isComparing && screenDimensions.isLarge)
  ) {
    return 'medium'
  } else return 'large'
}

export function useCreateChartTitle(
  metricConfig: MetricConfig,
  location: string,
  breakdown?: string
) {
  const theme = useTheme()

  const screenDimensions: ScreenDimensions = {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isSmall: useMediaQuery(theme.breakpoints.only('sm')),
    isNotLarge: useMediaQuery(theme.breakpoints.down('lg')),
    isLarge: useMediaQuery(theme.breakpoints.only('lg')),
    isComparing: window.location.href.includes('compare'),
  }

  const screenSize = determineScreenSize(screenDimensions)

  let { chartTitleLines } = metricConfig

  const dataName = chartTitleLines.join(' ')

  if (breakdown) chartTitleLines = [...chartTitleLines, breakdown]

  const filename = [chartTitleLines.join(' '), location].join(' ')

  const chartTitle = createTitle(chartTitleLines, location, screenSize)

  return {
    chartTitle,
    filename,
    dataName,
  }
}
