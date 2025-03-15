import * as d3 from 'd3'
import type {
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import { het } from '../../styles/DesignTokens'
import { getFillColor } from './colorSchemes'
import { generateTooltipHtml } from './tooltipUtils'

const { darkBlue: DARK_BLUE, redOrange: RED_ORANGE } = het

// Shared constants
export const TOOLTIP_OFFSET = { x: 10, y: 10 } as const

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
  isPhrmaAdherence: boolean
}

/**
 * Creates an event handler for a specific mouse event type
 * Works for both regular map areas and territory circles
 */
export const createEventHandler = (
  type: 'mouseover' | 'mouseout' | 'mousemove',
  props: MouseEventHandlerProps,
  transformFeature?: (d: any) => any,
) => {
  return (event: any, d: any) => {
    // If transformFeature is provided (like for territories), transform the feature
    const featureToUse = transformFeature ? transformFeature(d) : d
    handleMouseEvent(type, event, featureToUse, props)
  }
}

/**
 * Handles mouse events for map elements (both main map and territories)
 */
export const handleMouseEvent = (
  type: 'mouseover' | 'mouseout' | 'mousemove',
  event: any,
  d: any,
  props: MouseEventHandlerProps,
) => {
  if (!props.tooltipContainer) return

  switch (type) {
    case 'mouseover': {
      if (!d || !props.dataMap) return
      const value = props.dataMap.get(d.id as string)?.value

      d3.select(event.currentTarget)
        .attr('fill', value !== undefined ? DARK_BLUE : RED_ORANGE)
        .style('cursor', 'pointer')

      const tooltipHtml = generateTooltipHtml(
        d,
        props.dataMap,
        props.metricConfig,
        props.geographyType,
      )
      props.tooltipContainer.style('visibility', 'visible').html(tooltipHtml)
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
      d3.select(event.currentTarget).attr(
        'fill',
        getFillColor({
          d,
          dataMap: props.dataMap,
          colorScale: props.colorScale,
          extremesMode: props.extremesMode,
          mapConfig: props.mapConfig,
          isPhrmaAdherence: props.isPhrmaAdherence,
        }),
      )
      props.tooltipContainer.style('visibility', 'hidden').html('')
      break
    }
  }
}
