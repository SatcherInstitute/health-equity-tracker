import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { Fips } from '../../data/utils/Fips'
import { createUnknownLegend } from '../choroplethMap/mapLegendUtils'
import type { DataPoint } from '../choroplethMap/types'

interface UnknownMapGradientLegendProps {
  metricConfig: MetricConfig
  data: DataPoint[]
  colorScale: d3.ScaleSequential<string, never>
  fips: Fips
  width: number
}

const UnknownMapGradientLegend = ({
  metricConfig,
  data,
  colorScale,
  fips,
  width,
}: UnknownMapGradientLegendProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current || !data?.length || fips.isCounty()) {
      return
    }

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
    const legendGroup = svg
      .append('g')
      .attr('class', 'unknown-legend-container')

    createUnknownLegend(legendGroup, {
      dataWithHighestLowest: data,
      metricId: metricConfig.metricId,
      width: width,
      colorScale: colorScale,
    })
  }, [data, metricConfig.metricId, width, colorScale, fips])

  // Don't render if county level or no data
  if (fips.isCounty() || !data?.length) {
    return null
  }

  const legendTitle = `% Unknown`

  return (
    <div className='mt-4'>
      <div>
        <h3 className='pl-16 text-left font-bold text-gray-700 text-tinyTag'>
          {legendTitle}
        </h3>
        <p className='sr-only'>
          Share of cases with unknown demographic groups
        </p>
      </div>
      <svg
        ref={svgRef}
        className='h-8 w-full'
        aria-label={`Legend showing ${legendTitle} for unknown data percentages`}
      />
    </div>
  )
}

export default UnknownMapGradientLegend
