import * as d3 from 'd3'

export const createUnknownLegend = (
  legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  props: {
    width: number
    colorScale: d3.ScaleSequential<string>
    title: string
    isPct?: boolean
  },
) => {
  const { width, colorScale, title, isPct } = props
  const gradientLength = width * 0.35
  const legendHeight = 15
  const [legendLowerBound, legendUpperBound] = colorScale.domain()

  const legendContainer = legendGroup
    .append('g')
    .attr('class', 'unknowns-legend')
  legendContainer
    .append('text')
    .attr('x', 50)
    .attr('y', -5)
    .attr('text-anchor', 'start')
    .style('font', 'bold 10px sans-serif')
    .text(title)

  const gradient = legendContainer
    .append('defs')
    .append('linearGradient')
    .attr('id', 'unknowns-legend-gradient')
    .attr('x1', '0%')
    .attr('x2', '100%')
  gradient
    .selectAll('stop')
    .data(
      d3.ticks(legendLowerBound, legendUpperBound, 6).map((value) => ({
        offset: `${
          ((value - legendLowerBound) / (legendUpperBound - legendLowerBound)) *
          100
        }%`,
        color: colorScale(value),
      })),
    )
    .join('stop')
    .attr('offset', (d) => d.offset)
    .attr('stop-color', (d) => d.color)

  legendContainer
    .append('rect')
    .attr('x', 50)
    .attr('y', 0)
    .attr('width', gradientLength)
    .attr('height', legendHeight)
    .style('fill', 'url(#unknowns-legend-gradient)')

  legendContainer
    .append('rect')
    .attr('x', 50 + gradientLength + 20)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', legendHeight)
    .style('fill', '#ccc')

  legendContainer
    .append('text')
    .attr('x', 50 + gradientLength + 50)
    .attr('y', 12)
    .style('font', '10px sans-serif')
    .text('no data')

  const labelGroup = legendContainer
    .append('g')
    .attr('transform', `translate(0, ${legendHeight + 10})`)
  d3.ticks(legendLowerBound, legendUpperBound, 6).forEach((label) => {
    labelGroup
      .append('text')
      .attr(
        'x',
        ((label - legendLowerBound) / (legendUpperBound - legendLowerBound)) *
          gradientLength +
          50,
      )
      .attr('text-anchor', 'middle')
      .style('font', '10px sans-serif')
      .text(isPct ? `${label}%` : label.toFixed(1))
  })
}
