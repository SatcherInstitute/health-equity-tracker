import * as d3 from 'd3'
import type { DemographicType } from '../../data/query/Breakdowns'
import { het } from '../../styles/DesignTokens'
import { getFillColor } from './colorSchemes'
import {
  GEO_HOVERED_BORDER_COLOR,
  GEO_HOVERED_BORDER_WIDTH,
  GEO_HOVERED_OPACITY,
  STROKE_WIDTH,
} from './mapUtils'
import { generateTooltipHtml, TOOLTIP_OFFSET } from './tooltipUtils'
import type { MouseEventHandlerOptions, MouseEventType } from './types'

/**
 * Creates MouseEventHandlerOptions from component props
 * Works for both main map and territory components
 */
export const createMouseEventOptions = (
  options: any,
  dataMap?: Map<string, any>,
  geographyType?: string,
  demographicType?: DemographicType,
): MouseEventHandlerOptions => {
  return {
    colorScale: options.colorScale,
    metricConfig: options.metricConfig,
    dataMap: dataMap || options.dataMap,
    tooltipContainer: options.tooltipContainer,
    geographyType: geographyType || options.geographyType || '',
    mapConfig: options.mapConfig,
    isMultiMap: options.isMultiMap,
    isSummaryLegend: options.isSummaryLegend,
    isExtremesMode: options.isExtremesMode,
    updateFipsCallback: options.updateFipsCallback,
    demographicType: demographicType,
  }
}

/**
 * Creates an event handler for a specific mouse event type
 * Works for both regular map areas and territory circles
 */
export const createEventHandler = (
  type: MouseEventType,
  props: MouseEventHandlerOptions,
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
  type: MouseEventType,
  event: any,
  d: any,
  props: MouseEventHandlerOptions,
) => {
  if (!props.tooltipContainer) return

  switch (type) {
    case 'mouseover': {
      event.preventDefault()
      if (!d || !props.dataMap) return

      d3.select(event.currentTarget)
        .attr(
          'stroke',
          props.isExtremesMode ? het.altBlack : GEO_HOVERED_BORDER_COLOR,
        )
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
        .attr(
          'stroke',
          props.isExtremesMode ? het.altBlack : GEO_HOVERED_BORDER_COLOR,
        )
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
        .attr('stroke', props.isExtremesMode ? het.altDark : het.white)
        .attr('stroke-width', STROKE_WIDTH)
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
            isExtremesMode: props.isExtremesMode,
            mapConfig: props.mapConfig,
            isMultiMap: props.isMultiMap,
          }),
        )
        .attr('stroke', props.isExtremesMode ? het.altDark : het.white)
        .attr('stroke-width', STROKE_WIDTH)
        .attr('opacity', 1)
      props.tooltipContainer.style('visibility', 'hidden').html('')
      break
    }
  }
}
