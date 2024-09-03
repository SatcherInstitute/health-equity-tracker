import { MULTILINE_LABEL, AXIS_LABEL_Y_DELTA, LABEL_HEIGHT } from '../utils'
import { BAR_HEIGHT } from './constants'
import type { Axis } from 'vega'
import type { AxesProps } from './types'
import { ThemeZIndexValues } from '../../styles/DesignTokens'

export function Axes({ chartDimensions, xAxisTitle, yAxisTitle }: AxesProps) {
  const verticalTickBars: Axis = {
    scale: 'x',
    orient: 'bottom',
    gridScale: 'y',
    grid: true,
    tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
    tickMinStep: chartDimensions.verticalTickMinStep,
    domain: false,
    labels: false,
    aria: false,
    maxExtent: 0,
    minExtent: 0,
    ticks: false,
    zindex: ThemeZIndexValues.middle,
  }

  const axisTicks: Axis = {
    scale: 'x',
    orient: 'bottom',
    grid: false,
    title: xAxisTitle,
    titleX: chartDimensions.axisTitleX,
    titleAlign: chartDimensions.axisTitleAlign,
    labelFlush: true,
    labelOverlap: true,
    tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
    tickMinStep: chartDimensions.axisTickMinStep,
    zindex: ThemeZIndexValues.middle,
    titleLimit: { signal: 'width - 10' },
  }

  const yScale: Axis = {
    scale: 'y',
    orient: 'left',
    grid: false,
    title: yAxisTitle,
    zindex: ThemeZIndexValues.middle,
    tickSize: 5,
    labelBaseline: 'bottom',
    labelLimit: 100,
    encode: {
      labels: {
        update: {
          text: { signal: MULTILINE_LABEL },
          dy: { signal: AXIS_LABEL_Y_DELTA },
          lineHeight: { signal: LABEL_HEIGHT },
        },
      },
    },
  }

  return [verticalTickBars, axisTicks, yScale]
}
