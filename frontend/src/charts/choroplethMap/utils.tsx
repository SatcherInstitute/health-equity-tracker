// utils/mapUtils.ts
import * as d3 from 'd3'
import type { FeatureCollection } from 'geojson'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import type { MetricId } from '../../data/config/MetricConfigTypes'
import { getTooltipContent } from './tooltipUtils'
import type { DataPoint, RenderMapProps } from './types'

export const createFeatures = async (
  geoData: Topology | null,
  showCounties: boolean,
  fallbackUrl?: string,
): Promise<FeatureCollection | null> => {
  try {
    let topology: Topology

    if (geoData) {
      topology = geoData
    } else if (fallbackUrl) {
      const response = await window.fs.readFile(fallbackUrl)
      const text = new TextDecoder().decode(response)
      topology = JSON.parse(text)
    } else {
      throw new Error('No geoData or fallback URL provided')
    }

    const geographyKey = showCounties ? 'counties' : 'states'
    if (!topology.objects[geographyKey]) {
      console.error(`Missing ${geographyKey} in geoData objects`)
      return null
    }

    const features = feature(
      topology,
      topology.objects[geographyKey],
    ) as FeatureCollection

    if (!features || !features.features.length) {
      console.error('Failed to convert topology to features')
      return null
    }

    return features
  } catch (error) {
    console.error('Error creating features:', error)
    return null
  }
}

export const createProjection = (
  width: number,
  height: number,
  features: FeatureCollection,
) => {
  return d3.geoAlbersUsa().fitSize([width, height], features)
}

// Helper function to create both features and projection
export const setupMap = async (
  geoData: Topology,
  showCounties: boolean,
  width: number,
  height: number,
  fallbackUrl?: string,
) => {
  const features = await createFeatures(geoData, showCounties, fallbackUrl)
  if (!features) return null

  const projection = createProjection(width, height, features)
  return { features, projection }
}

export const createColorScale = (data: DataPoint[], metricId: MetricId) => {
  const values = data.map((d) => d[metricId]).filter((v) => v != null)
  const [min, max] = d3.extent(values)

  console.log('Color scale domain:', { min, max })

  return d3.scaleSequential(d3.interpolateGnBu).domain([min ?? 0, max ?? 1])
}

export const renderMap = (props: RenderMapProps) => {
  const svg = d3
    .select(props.svgRef.current)
    .attr('width', props.width)
    .attr('height', props.height)
    .append('g')

  const { features, projection } = props.geoData
  const path = d3.geoPath(projection)

  const dataMap = new Map(props.data.map((d) => [d.fips, d[props.metricId]]))
  const colorScale = createColorScale(props.data, props.metricId)

  svg
    .selectAll('path')
    .data(features.features)
    .enter()
    .append('path')
    .attr('d', (d) => path(d) || '')
    .attr('fill', (d) => {
      const value = dataMap.get(d.id as string)
      return value !== undefined ? colorScale(value) : '#ccc'
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5)
    .attr('class', 'transition-colors duration-200 hover:opacity-80')
    .on('mouseover', (event, d) => {
      const value = dataMap.get(d.id as string)
      props.tooltipContainer
        .style('visibility', 'visible')
        .html(getTooltipContent(d, value, props.tooltipPairs))
    })
    .on('mousemove', (event) => {
      props.tooltipContainer
        .style('top', `${event.pageY + 10}px`)
        .style('left', `${event.pageX + 10}px`)
    })
    .on('mouseout', () => {
      props.tooltipContainer.style('visibility', 'hidden')
    })
}
