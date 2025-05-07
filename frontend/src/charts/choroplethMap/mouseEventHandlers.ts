import * as d3 from 'd3'
import type {
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import type { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { getFillColor } from './colorSchemes'
import {
  GEO_HOVERED_BORDER_COLOR,
  GEO_HOVERED_BORDER_WIDTH,
  GEO_HOVERED_OPACITY,
  TOOLTIP_OFFSET,
  generateTooltipHtml,
} from './tooltipUtils'

const { darkBlue: DARK_BLUE, redOrange: RED_ORANGE } = het

// Add a flag to detect touch devices
let isTouchDevice = false

// Set up touch detection
const detectTouch = () => {
  isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  window.removeEventListener('touchstart', detectTouch)
}

// Initialize touch detection
window.addEventListener('touchstart', detectTouch, { once: true })

/**
 * Common interface for mouse event handler properties
 */
export interface MouseEventHandlerProps {
  colorScale: any
  metricConfig: MetricConfig
  dataMap: Map<string, any>
  tooltipContainer: any
  geographyType: string
  extremesMode: boolean
  mapConfig: MapConfig
  isMultiMap: boolean
  isSummaryLegend: boolean
  updateFipsCallback: (fips: Fips) => void
}

/**
 * Creates MouseEventHandlerProps from component props
 * Works for both main map and territory components
 */
export const createMouseEventProps = (
  props: any,
  dataMap?: Map<string, any>,
  geographyType?: string,
): MouseEventHandlerProps => {
  return {
    colorScale: props.colorScale,
    metricConfig: props.metricConfig,
    dataMap: dataMap || props.dataMap,
    tooltipContainer: props.tooltipContainer,
    geographyType: geographyType || props.geographyType || '',
    extremesMode: props.extremesMode,
    mapConfig: props.mapConfig,
    isMultiMap: props.isMultiMap,
    isSummaryLegend: props.isSummaryLegend,
    updateFipsCallback: props.updateFipsCallback,
  }
}

export type mouseEventType =
  | 'mouseover'
  | 'pointerdown'
  | 'mouseout'
  | 'mousemove'
  | 'touchstart'
  | 'touchend'

/**
 * Creates an event handler for a specific mouse event type
 * Works for both regular map areas and territory circles
 */
export const createEventHandler = (
  type: mouseEventType,
  props: MouseEventHandlerProps,
  transformFeature?: (d: any) => any,
) => {
  return (event: PointerEvent, d: any) => {
    // If transformFeature is provided (like for territories), transform the feature
    const featureToUse = transformFeature ? transformFeature(d) : d

    handleMouseEvent(type, event, featureToUse, props)
  }
}

/**
 * Handles mouse events for map elements (both main map and territories)
 */
const handleMouseEvent = (
  type: mouseEventType,
  event: any,
  d: any,
  props: MouseEventHandlerProps,
) => {
  if (!props.tooltipContainer) return

  switch (type) {
    case 'mouseover': {
      event.preventDefault()
      if (!d || !props.dataMap) return

      d3.select(event.currentTarget)
        .attr('stroke', GEO_HOVERED_BORDER_COLOR)
        .attr('stroke-width', GEO_HOVERED_BORDER_WIDTH)
        .attr('opacity', GEO_HOVERED_OPACITY)
        .style('cursor', props.isSummaryLegend ? 'default' : 'pointer')

      const tooltipHtml = generateTooltipHtml(d, type, props)
      props.tooltipContainer.style('visibility', 'visible').html(tooltipHtml)
      break
    }
    case 'touchstart': {
      event.preventDefault()

      d3.select(event.currentTarget)
        .attr('stroke', GEO_HOVERED_BORDER_COLOR)
        .attr('stroke-width', GEO_HOVERED_BORDER_WIDTH)
        .attr('opacity', GEO_HOVERED_OPACITY)

      const tooltipHtml = generateTooltipHtml(d, type, props)
      props.tooltipContainer.style('visibility', 'visible').html(tooltipHtml)

      // Position the tooltip based on touch position
      const touchX = event.touches[0].pageX
      const touchY = event.touches[0].pageY
      const screenWidth = window.innerWidth

      const tooltipX =
        touchX > screenWidth / 2
          ? touchX -
            TOOLTIP_OFFSET.x -
            props.tooltipContainer.node()!.getBoundingClientRect().width
          : touchX + TOOLTIP_OFFSET.x

      props.tooltipContainer
        .style('top', `${touchY + TOOLTIP_OFFSET.y}px`)
        .style('left', `${tooltipX}px`)
      break
    }
    case 'touchend': {
      d3.select(event.currentTarget)
        .attr('stroke', '')
        .attr('stroke-width', '')
        .attr('opacity', 1)
      break
    }
    case 'mousemove': {
      // Get screen width and cursor position
      const screenWidth = window.innerWidth
      const cursorX = event.pageX

      // If cursor is past halfway point, show tooltip to the left
      const tooltipX =
        cursorX > screenWidth / 2
          ? event.pageX -
            TOOLTIP_OFFSET.x -
            props.tooltipContainer.node()!.getBoundingClientRect().width
          : event.pageX + TOOLTIP_OFFSET.x

      props.tooltipContainer
        .style('top', `${event.pageY + TOOLTIP_OFFSET.y}px`)
        .style('left', `${tooltipX}px`)
      break
    }
    case 'mouseout': {
      d3.select(event.currentTarget)
        .attr(
          'fill',
          getFillColor({
            d,
            dataMap: props.dataMap,
            colorScale: props.colorScale,
            extremesMode: props.extremesMode,
            mapConfig: props.mapConfig,
            isMultiMap: props.isMultiMap,
          }),
        )
        .attr('stroke', '')
        .attr('stroke-width', '')
        .attr('opacity', 1)
      props.tooltipContainer.style('visibility', 'hidden').html('')
      break
    }
  }
}
