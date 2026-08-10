import { select } from 'd3'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import { colors } from '../../styles/tokens/colors'
import { DATA_SUPPRESSED, NO_DATA_MESSAGE } from '../mapGlobals'
import { getFillColor, getStrokeColor } from './colorSchemes'
import {
  GEO_HOVERED_BORDER_COLOR,
  GEO_HOVERED_BORDER_WIDTH,
  GEO_HOVERED_OPACITY,
  STROKE_WIDTH,
} from './mapUtils'
import {
  type MapTooltipData,
  type MapTooltipEntry,
  METRIC_DATA_INTERNAL_KEYS,
  type MetricData,
  type MouseEventHandlerOptions,
  type MouseEventType,
} from './types'

function buildTooltipEntries(
  data: MetricData | undefined,
  geographyType: string,
  demographicType: DemographicType | undefined,
): MapTooltipEntry[] {
  if (!data) return []
  const missingDataValue = data.isSuppressed ? DATA_SUPPRESSED : NO_DATA_MESSAGE
  return Object.entries(data)
    .filter(([key]) => !METRIC_DATA_INTERNAL_KEYS.includes(key as any))
    .filter(([key]) => !(key === 'County SVI' && geographyType !== 'County'))
    .map(([key, rawValue]) => {
      if (key.startsWith('% unknown')) {
        const demoLabel = demographicType
          ? DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
          : 'demographic'
        return {
          label: '',
          value:
            rawValue != null
              ? `${rawValue} of ${demoLabel} data missing`
              : missingDataValue,
        }
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
    showTooltip: options.showTooltip,
    hideTooltip: options.hideTooltip,
    geographyType: geographyType || options.geographyType || '',
    mapConfig: options.mapConfig,
    isMultiMap: options.isMultiMap,
    isSummaryLegend: options.isSummaryLegend,
    isExtremesMode: options.isExtremesMode,
    updateFipsCallback: options.updateFipsCallback,
    demographicType,
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

      const fillColorOnHover = getFillColor({
        d,
        dataMap: props.dataMap,
        colorScale: props.colorScale,
        isExtremesMode: props.isExtremesMode,
        mapConfig: props.mapConfig,
        isMultiMap: props.isMultiMap,
      })
      const isNoDataShape =
        !props.isExtremesMode && fillColorOnHover === colors.altWhite

      const hoveredEl = select(event.currentTarget)
        .attr(
          'stroke',
          isNoDataShape
            ? colors.altWhite
            : props.isExtremesMode
              ? colors.altBlack
              : GEO_HOVERED_BORDER_COLOR,
        )
        .attr('stroke-width', GEO_HOVERED_BORDER_WIDTH)
        .attr('opacity', isNoDataShape ? 1 : GEO_HOVERED_OPACITY)
        .style('cursor', props.isSummaryLegend ? 'default' : 'pointer')

      if (isNoDataShape) {
        hoveredEl.attr('fill', colors.altGray)
      }

      const name = d.properties?.name || String(d.id)
      const data = props.dataMap.get(d.id as string)
      const tooltipData: MapTooltipData = {
        name,
        geographyType: props.geographyType,
        featureId: String(d.id),
        isSummaryLegend: props.isSummaryLegend,
        entries: buildTooltipEntries(
          data,
          props.geographyType,
          props.demographicType,
        ),
      }
      props.showTooltip(tooltipData, event.clientX, event.clientY)
      break
    }
    case 'touchstart': {
      const fillColorOnTouch = getFillColor({
        d,
        dataMap: props.dataMap,
        colorScale: props.colorScale,
        isExtremesMode: props.isExtremesMode,
        mapConfig: props.mapConfig,
        isMultiMap: props.isMultiMap,
      })
      const isNoDataOnTouch =
        !props.isExtremesMode && fillColorOnTouch === colors.altWhite

      const touchedEl = select(event.currentTarget)
        .attr(
          'stroke',
          isNoDataOnTouch
            ? colors.altWhite
            : props.isExtremesMode
              ? colors.altBlack
              : GEO_HOVERED_BORDER_COLOR,
        )
        .attr('stroke-width', GEO_HOVERED_BORDER_WIDTH)
        .attr('opacity', isNoDataOnTouch ? 1 : GEO_HOVERED_OPACITY)

      if (isNoDataOnTouch) {
        touchedEl.attr('fill', colors.altGray)
      }

      const touch = event.touches[0]
      const name = d.properties?.name || String(d.id)
      const data = props.dataMap.get(d.id as string)
      const tooltipData: MapTooltipData = {
        name,
        geographyType: props.geographyType,
        featureId: String(d.id),
        isSummaryLegend: props.isSummaryLegend,
        entries: buildTooltipEntries(
          data,
          props.geographyType,
          props.demographicType,
        ),
      }
      props.showTooltip(tooltipData, touch.clientX, touch.clientY)
      break
    }
    case 'touchend': {
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
        .attr(
          'stroke',
          getStrokeColor({
            d,
            dataMap: props.dataMap,
            colorScale: props.colorScale,
            isExtremesMode: props.isExtremesMode,
            mapConfig: props.mapConfig,
            isMultiMap: props.isMultiMap,
          }),
        )
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
        .attr(
          'stroke',
          getStrokeColor({
            d,
            dataMap: props.dataMap,
            colorScale: props.colorScale,
            isExtremesMode: props.isExtremesMode,
            mapConfig: props.mapConfig,
            isMultiMap: props.isMultiMap,
          }),
        )
        .attr('stroke-width', STROKE_WIDTH)
        .attr('opacity', 1)
      props.hideTooltip()
      break
    }
  }
}
