import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import * as topojson from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

interface GeorgiaTopology extends Topology {
  objects: {
    tracts: GeometryCollection<{
      id: string // Tract ID
    }>
  }
}

const GeorgiaCountiesTractsMap: React.FC<{ topoJson: GeorgiaTopology }> = ({
  topoJson,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!topoJson || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600

    // Convert to GeoJSON features
    const features = topojson.feature(topoJson, topoJson.objects.tracts)

    if (!features || features.type !== 'FeatureCollection') return

    // Create projection
    const projection = d3.geoMercator().fitSize([width, height], features)

    const pathGenerator = d3.geoPath().projection(projection)

    // Create a tooltip div
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '10px')
      .style('border', '1px solid black')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0)

    // Render tracts with hover effects and tooltip
    svg
      .selectAll('path')
      .data(features.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('fill', 'steelblue')
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .on('mouseover', function (event, d) {
        // Highlight tract
        d3.select(this).attr('fill', 'orange')

        // Show tooltip
        tooltip.transition().duration(200).style('opacity', 0.9)
        tooltip
          .html(`
            <strong>Tract ID:</strong> ${d.properties?.id || 'Unknown'}
          `)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px')
      })
      .on('mouseout', function () {
        // Restore original color
        d3.select(this).attr('fill', 'steelblue')

        // Hide tooltip
        tooltip.transition().duration(500).style('opacity', 0)
      })

    // Cleanup function to remove tooltip when component unmounts
    return () => {
      tooltip.remove()
    }
  }, [topoJson])

  return <svg ref={svgRef} width={800} height={600} viewBox='0 0 800 600' />
}

export default GeorgiaCountiesTractsMap
