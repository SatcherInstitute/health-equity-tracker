import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import * as topojson from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import topoJson13063 from '../../public/tmp/13063.topo.json'
import topoJson13067 from '../../public/tmp/13067.topo.json'
import topoJson13089 from '../../public/tmp/13089.topo.json'
import topoJson13121 from '../../public/tmp/13121.topo.json'
import topoJson13135 from '../../public/tmp/13135.topo.json'
import { het } from '../styles/DesignTokens'

const countyNames: { [key: string]: string } = {
  '13063': 'Clayton County',
  '13067': 'Gwinnett County',
  '13089': 'DeKalb County',
  '13121': 'Fulton County',
  '13135': 'Gwinnett County',
}

const countyBorderColors: { [key: string]: string } = {
  '13063': het.white,
  '13067': het.white,
  '13089': het.white,
  '13121': het.white,
  '13135': het.white,
}

interface GeorgiaTopology extends Topology {
  objects: {
    tracts: GeometryCollection<{
      id: string
    }>
  }
}

const GeorgiaCountiesTractsMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  const topoJsonFiles = [
    { topo: topoJson13063, countyId: '13063' },
    { topo: topoJson13067, countyId: '13067' },
    { topo: topoJson13089, countyId: '13089' },
    { topo: topoJson13121, countyId: '13121' },
    { topo: topoJson13135, countyId: '13135' },
  ]

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600

    const combinedFeatures = topoJsonFiles.flatMap(({ topo, countyId }) => {
      const topology = topo as GeorgiaTopology
      const countyFeatures = topojson.feature(topology, topology.objects.tracts)
      return countyFeatures.features.map((feature) => ({
        ...feature,
        countyBorderColor: countyBorderColors[countyId],
        countyName: countyNames[countyId],
      }))
    })

    const projection = d3.geoMercator().fitSize([width, height], {
      type: 'FeatureCollection',
      features: combinedFeatures,
    })

    const pathGenerator = d3.geoPath().projection(projection)

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

    svg
      .selectAll('path')
      .data(combinedFeatures)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('fill', het.mapLight)
      .attr('stroke', (d) => d.countyBorderColor)
      .attr('stroke-width', 1)
      .each(function (d) {
        // Store county border color as a data attribute
        ;(this as SVGPathElement).setAttribute(
          'data-border-color',
          d.countyBorderColor,
        )
      })
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', 'forestgreen')
        tooltip.transition().duration(200).style('opacity', 0.9)
        tooltip
          .html(`
            <strong>County:</strong> ${d.countyName}<br>
            <strong>Tract ID:</strong> ${d.properties?.id || 'Unknown'}
          `)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', het.mapLight)
        tooltip.transition().duration(500).style('opacity', 0)
      })

    return () => {
      tooltip.remove()
    }
  }, [])

  return <svg ref={svgRef} width={800} height={600} viewBox='0 0 800 600' />
}

export default GeorgiaCountiesTractsMap
