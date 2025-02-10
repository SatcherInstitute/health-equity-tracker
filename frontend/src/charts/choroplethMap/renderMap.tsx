import * as d3 from 'd3'
import { createRoot } from 'react-dom/client'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import {
  getCawpMapGroupDenominatorLabel,
  getCawpMapGroupNumeratorLabel,
  getCountyAddOn,
  getMapGroupLabel,
} from '../mapHelperFunctions'
import TooltipContent from './TooltipContent'
import { getFillColor } from './mapHelpers'
import { createUnknownLegend } from './mapLegendUtils'
import type { InitializeSvgProps, MetricData, RenderMapProps } from './types'

const {
  darkBlue: DARK_BLUE,
  redOrange: RED_ORANGE,
  white: WHITE,
  borderColor: BORDER_GREY,
} = het

const STROKE_WIDTH = 0.5
const TOOLTIP_OFFSET = { x: 10, y: 10 }

export const renderMap = (props: RenderMapProps) => {
  const { features, projection } = props.geoData
  const geographyType = getCountyAddOn(props.fips, props.showCounties)
  const {
    colorScale,
    height,
    width,
    svgRef,
    tooltipContainer,
    isMobile,
    metric,
    extremesMode,
  } = props

  // Clear existing SVG content and initialize
  d3.select(svgRef.current).selectAll('*').remove()
  const { legendGroup, mapGroup } = initializeSvg({
    svgRef,
    width,
    height,
    isMobile,
  })

  projection.fitSize([width, height * 0.8], features)
  const path = d3.geoPath(projection)

  const tooltipLabel = props.isUnknownsMap
    ? metric.unknownsVegaLabel || '% unknown'
    : CAWP_METRICS.includes(metric.metricId)
      ? `Rate — ${getWomenRaceLabel(props.activeDemographicGroup)}`
      : getMapGroupLabel(
          props.demographicType,
          props.activeDemographicGroup,
          metric.type === 'index' ? 'Score' : 'Rate',
        )

  const numeratorPhrase = props.isCawp
    ? getCawpMapGroupNumeratorLabel(
        props.countColsMap,
        props.activeDemographicGroup,
      )
    : getMapGroupLabel(
        props.demographicType,
        props.activeDemographicGroup,
        props.countColsMap?.numeratorConfig?.shortLabel ?? '',
      )

  const denominatorPhrase = props.isCawp
    ? getCawpMapGroupDenominatorLabel(props.countColsMap)
    : getMapGroupLabel(
        props.demographicType,
        props.activeDemographicGroup,
        props.countColsMap?.denominatorConfig?.shortLabel ?? '',
      )

  const dataMap: Map<string, MetricData> = new Map(
    props.dataWithHighestLowest.map((d) => [
      d.fips,
      {
        [tooltipLabel]: d[props.metric.metricId],
        value: d[props.metric.metricId],
        ...(props.countColsMap?.numeratorConfig && {
          [`# ${numeratorPhrase}`]:
            d[props.countColsMap.numeratorConfig.metricId],
        }),
        ...(props.countColsMap?.denominatorConfig && {
          [`# ${denominatorPhrase}`]:
            d[props.countColsMap.denominatorConfig.metricId],
        }),
        ...(d.highestGroup && { ['Highest rate group']: d.highestGroup }),
        ...(d.lowestGroup && { ['Lowest rate group']: d.lowestGroup }),
        ...(d.rating && { ['County SVI']: d.rating }),
      },
    ]),
  )

  // Draw map
  mapGroup
    .selectAll('path')
    .data(features.features)
    .join('path')
    .attr('d', (d) => path(d) || '')
    .attr('fill', (d) => getFillColor({ d, dataMap, colorScale, extremesMode }))
    .attr('stroke', extremesMode ? BORDER_GREY : WHITE)
    .attr('stroke-width', STROKE_WIDTH)
    .on('mouseover', (event, d) =>
      handleMouseEvent(
        'mouseover',
        event,
        d,
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
      ),
    )
    .on('mousemove', (event, d) =>
      handleMouseEvent(
        'mousemove',
        event,
        d,
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
      ),
    )
    .on('mouseout', (event, d) =>
      handleMouseEvent(
        'mouseout',
        event,
        d,
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
      ),
    )
    .on('click', (event, d) => handleMapClick(d, props.updateFipsCallback))

  if (!props.hideLegend && !props.fips.isCounty() && props.isUnknownsMap) {
    const { metricId } = metric
    createUnknownLegend(legendGroup, {
      dataWithHighestLowest: props.dataWithHighestLowest,
      metricId,
      width,
      colorScale,
      title: '% unknown',
      isMobile,
      isPct: true,
    })
  }
}

const initializeSvg = (props: InitializeSvgProps) => {
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const svg = d3
    .select(props.svgRef.current)
    .attr('width', props.width)
    .attr('height', props.height)

  return {
    svg,
    legendGroup: svg
      .append('g')
      .attr('class', 'legend-container')
      .attr(
        'transform',
        `translate(${margin.left}, ${props.isMobile ? 0 : margin.top})`,
      ),
    mapGroup: svg
      .append('g')
      .attr('class', 'map-container')
      .attr(
        'transform',
        `translate(${margin.left}, ${props.isMobile ? margin.top + 10 : margin.top + 50})`,
      ),
  }
}

const handleMouseEvent = (
  type: 'mouseover' | 'mousemove' | 'mouseout',
  event: any,
  d: any,
  colorScale: d3.ScaleSequential<string>,
  metric: MetricConfig,
  dataMap: Map<string, MetricData>,
  tooltipContainer?: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  geographyType?: string,
  extremesMode?: boolean,
) => {
  if (!tooltipContainer) return

  const tooltipNode = tooltipContainer.node()
  if (!tooltipNode) return

  if (type === 'mouseover' && d && dataMap) {
    const value = dataMap.get(d.id as string)?.value

    d3.select(event.currentTarget)
      .attr('fill', value !== undefined ? DARK_BLUE : RED_ORANGE)
      .style('cursor', 'pointer')

    // Use ReactDOM to render the tooltip component inside the tooltip container
    const root = createRoot(tooltipNode)
    root.render(
      <TooltipContent
        feature={d}
        dataMap={dataMap}
        metricConfig={metric}
        geographyType={geographyType}
      />,
    )

    tooltipContainer.style('visibility', 'visible')
  } else if (type === 'mousemove') {
    tooltipContainer
      .style('top', `${event.pageY + TOOLTIP_OFFSET.y}px`)
      .style('left', `${event.pageX + TOOLTIP_OFFSET.x}px`)
  } else if (type === 'mouseout') {
    d3.select(event.currentTarget).attr(
      'fill',
      getFillColor({ d, dataMap, colorScale, extremesMode }),
    )

    tooltipContainer.style('visibility', 'hidden')

    // Clear the tooltip content when the mouse leaves
    const root = createRoot(tooltipNode)
    root.unmount()
  }
}

const handleMapClick = (d: any, updateFipsCallback: (fips: Fips) => void) => {
  const clickedFips = d.id as string
  if (clickedFips) {
    updateFipsCallback(new Fips(clickedFips))
    location.hash = '#unknown-demographic-map'
  }
}
