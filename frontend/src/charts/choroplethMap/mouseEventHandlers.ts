import { select } from 'd3'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import { colors } from '../../styles/tokens/colors'
import { DATA_SUPPRESSED, NO_DATA_MESSAGE } from '../mapGlobals'
import { getFillColor } from './colorSchemes'
import {
  GEO_HOVERED_BORDER_COLOR,
  GEO_HOVERED_BORDER_WIDTH,
  GEO_HOVERED_OPACITY,
  STROKE_WIDTH,
} from './mapUtils'
import type {
  MapTooltipData,
  MapTooltipEntry,
  MouseEventHandlerOptions,
  MouseEventType,
} from './types'

function buildTooltipEntries(
  data: Record<string, any> | undefined,
  geographyType: string,
  demographicType: DemographicType | undefined,
  allMissingDataIsSuppressed: boolean,
): MapTooltipEntry[] {
  if (!data) return []
  const missingDataValue = allMissingDataIsSuppressed
    ? DATA_SUPPRESSED
    : NO_DATA_MESSAGE
  return Object.entries(data)
    .filter(([key]) => key !== 'value')
    .filter(([key]) => !(key === 'County SVI' && geographyType !== 'County'))
    .map(([key, rawValue]) => {
      if (key.startsWith('% unknown')) {
        const demoLabel = demographicType
          ? DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
          : 'demographic'
        return { label: '', value: `${rawValue}% of ${demoLabel} data missing` }
      }
      return {
        label: key,
        value:
          rawValue == null
            ? missingDataValue
            : String(rawValue.toLocaleString()),
      }
    })
}

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
    tooltipCallbacks: options.tooltipCallbacks,
    geographyType: geographyType || options.geographyType || '',
    mapConfig: options.mapConfig,
    isMultiMap: options.isMultiMap,
    isSummaryLegend: options.isSummaryLegend,
    isExtremesMode: options.isExtremesMode,
    updateFipsCallback: options.updateFipsCallback,
    demographicType,
    allMissingDataIsSuppressed: options.allMissingDataIsSuppressed,
  }
}

export const createEventHandler = (
  type: MouseEventType,
  props: MouseEventHandlerOptions,
  transformFeature?: (d: any) => any,
) => {
  return (event: PointerEvent, d: any) => {
    const featureToUse = transformFeature ? transformFeature(d) : d
    handleMouseEvent(type, event, featureToUse, props)
  }
}

const handleMouseEvent = (
  type: MouseEventType,
  event: any,
  d: any,
  props: MouseEventHandlerOptions,
) => {
  switch (type) {
    case 'mouseover': {
      event.preventDefault()
      if (!d || !props.dataMap) return

      select(event.currentTarget)
        .attr(
          'stroke',
          props.isExtremesMode ? colors.altBlack : GEO_HOVERED_BORDER_COLOR,
        )
        .attr('stroke-width', GEO_HOVERED_BORDER_WIDTH)
        .attr('opacity', GEO_HOVERED_OPACITY)
        .style('cursor', props.isSummaryLegend ? 'default' : 'pointer')

      const name = d.properties?.name || String(d.id)
      const data = props.dataMap.get(d.id as string)
      const tooltipData: MapTooltipData = {
        name,
        geographyType: props.geographyType,
        featureId: String(d.id),
        isSummaryLegend: props.isSummaryLegend,
        eventType: 'mouse',
        entries: buildTooltipEntries(
          data,
          props.geographyType,
          props.demographicType,
          props.allMissingDataIsSuppressed,
        ),
      }
      props.tooltipCallbacks.onShow(tooltipData, event.clientX, event.clientY)
      break
    }
    case 'touchstart': {
      event.preventDefault()

      select(event.currentTarget)
        .attr(
          'stroke',
          props.isExtremesMode ? colors.altBlack : GEO_HOVERED_BORDER_COLOR,
        )
        .attr('stroke-width', GEO_HOVERED_BORDER_WIDTH)
        .attr('opacity', GEO_HOVERED_OPACITY)

      const touch = event.touches[0]
      const name = d.properties?.name || String(d.id)
      const data = props.dataMap.get(d.id as string)
      const tooltipData: MapTooltipData = {
        name,
        geographyType: props.geographyType,
        featureId: String(d.id),
        isSummaryLegend: props.isSummaryLegend,
        eventType: 'touch',
        entries: buildTooltipEntries(
          data,
          props.geographyType,
          props.demographicType,
          props.allMissingDataIsSuppressed,
        ),
      }
      props.tooltipCallbacks.onShow(tooltipData, touch.clientX, touch.clientY)
      break
    }
    case 'touchend': {
      select(event.currentTarget)
        .attr('stroke', props.isExtremesMode ? colors.altGray : colors.altWhite)
        .attr('stroke-width', STROKE_WIDTH)
        .attr('opacity', 1)
      break
    }
    case 'mouseout': {
      select(event.currentTarget)
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
        .attr('stroke', props.isExtremesMode ? colors.altGray : colors.altWhite)
        .attr('stroke-width', STROKE_WIDTH)
        .attr('opacity', 1)
      props.tooltipCallbacks.onHide()
      break
    }
  }
}
