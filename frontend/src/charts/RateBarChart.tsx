import { max, scaleBand, scaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import { sortForVegaByIncome } from '../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { addLineBreakDelimitersToField, addMetricDisplayColumn } from './utils'

// Constants
const MARGIN = { top: 20, right: 20, bottom: 30, left: 160 } // Increased left margin for wrapped labels
const BAR_PADDING = 0.2
const LABEL_SWAP_CUTOFF_PERCENT = 66
const MAX_LABEL_WIDTH = 140
const CORNER_RADIUS = 4

interface RateBarChartProps {
  data: HetRow[]
  metric: MetricConfig
  demographicType: DemographicType
  fips: Fips
  filename?: string
  usePercentSuffix?: boolean
  className?: string
  useIntersectionalComparisonAlls?: boolean
  comparisonAllSubGroup?: string
}

function wrapLabel(text: string, width: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length * 6 <= width) {
      // Approximate character width
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function formatValue(value: number, usePercentSuffix: boolean): string {
  if (value >= 100000) {
    return value >= 10
      ? `${Math.round(value).toLocaleString()}${usePercentSuffix ? '%' : ''}`
      : `${value.toFixed(1)}${usePercentSuffix ? '%' : ''}`
  }
  return `${value.toFixed(1)}${usePercentSuffix ? '%' : ''}`
}

export function RateBarChart({
  data,
  metric,
  demographicType,
  usePercentSuffix = false,
}: RateBarChartProps) {
  const [containerRef, width] = useResponsiveWidth()

  // Data preprocessing
  const processedData = useMemo(() => {
    const processedRows = addLineBreakDelimitersToField(data, demographicType)
    const [rowsWithDisplayCol] = addMetricDisplayColumn(metric, processedRows)
    let [finalData] = addMetricDisplayColumn(
      metric,
      rowsWithDisplayCol,
      true, // omitPctSymbol
    )

    if (demographicType === 'income') {
      finalData = sortForVegaByIncome(finalData)
    }

    return finalData
  }, [data, demographicType, metric])

  // Prepare wrapped labels
  const wrappedLabels = useMemo(() => {
    return processedData.map((d) => ({
      original: d[demographicType],
      lines: wrapLabel(d[demographicType], MAX_LABEL_WIDTH),
    }))
  }, [processedData, demographicType])

  // Calculate dimensions
  const maxLines = Math.max(...wrappedLabels.map((label) => label.lines.length))
  const barHeight = 30 // Base height for single line
  const adjustedBarHeight = Math.max(barHeight, maxLines * 16) // Adjust if we need more height for wrapped labels
  const height = processedData.length * (adjustedBarHeight + 10) // 10px gap between bars
  const innerWidth = width - MARGIN.left - MARGIN.right
  const innerHeight = height - MARGIN.top - MARGIN.bottom

  // Scales
  const xScale = useMemo(() => {
    const maxValue = max(processedData, (d) => d[metric.metricId]) || 0
    return scaleLinear().domain([0, maxValue]).range([0, innerWidth])
  }, [processedData, innerWidth, metric.metricId])

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(processedData.map((d) => d[demographicType]))
      .range([0, innerHeight])
      .padding(BAR_PADDING)
  }, [processedData, innerHeight, demographicType])

  const barLabelBreakpoint = useMemo(() => {
    const maxValue = max(processedData, (d) => d[metric.metricId]) || 0
    return maxValue * (LABEL_SWAP_CUTOFF_PERCENT / 100)
  }, [processedData, metric.metricId])

  return (
    <div ref={containerRef}>
      {/* biome-ignore lint/a11y/noSvgWithoutTitle:we need to allow hovering of individual chart elements */}
      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Vertical Gridlines */}
          <g className='gridlines'>
            {xScale.ticks(20).map((tick) => (
              <line
                key={`gridline-${tick}`}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                className='stroke-timberwolf'
                // strokeDasharray='2,2'
              />
            ))}
          </g>
          {/* Y Axis */}
          <g className='y-axis'>
            {wrappedLabels.map((label, index) => (
              <g
                key={label.original}
                transform={`translate(0,${yScale(label.original)})`}
              >
                {label.lines.map((line, lineIndex) => (
                  <text
                    key={lineIndex}
                    x={-5}
                    y={
                      yScale.bandwidth() / 2 -
                      (label.lines.length - 1) * 8 +
                      lineIndex * 16
                    }
                    dy='.32em'
                    textAnchor='end'
                    className='text-smallest'
                  >
                    {line}
                  </text>
                ))}
              </g>
            ))}
          </g>

          {/* Bars */}
          {processedData.map((d) => {
            const barWidth = xScale(d[metric.metricId])
            const shouldLabelBeInside = d[metric.metricId] > barLabelBreakpoint

            return (
              <g
                key={d[demographicType]}
                transform={`translate(0,${yScale(d[demographicType])})`}
              >
                <path
                  d={`
                    M 0,0
                    h ${barWidth - CORNER_RADIUS}
                    q ${CORNER_RADIUS},0 ${CORNER_RADIUS},${CORNER_RADIUS}
                    v ${yScale.bandwidth() - 2 * CORNER_RADIUS}
                    q 0,${CORNER_RADIUS} -${CORNER_RADIUS},${CORNER_RADIUS}
                    h -${barWidth - CORNER_RADIUS}
                    Z
                  `}
                  className={
                    d[demographicType] === 'All'
                      ? 'fill-timeYellow'
                      : 'fill-altGreen'
                  }
                />
                <text
                  x={shouldLabelBeInside ? barWidth - 5 : barWidth + 5}
                  y={yScale.bandwidth() / 2}
                  dy='.32em'
                  textAnchor={shouldLabelBeInside ? 'end' : 'start'}
                  className={`text-sm ${
                    shouldLabelBeInside ? 'fill-white' : 'fill-current'
                  }`}
                >
                  {formatValue(d[metric.metricId], usePercentSuffix)}
                </text>
              </g>
            )
          })}

          {/* X Axis */}
          <g className='x-axis' transform={`translate(0,${innerHeight})`}>
            <line x1={0} x2={innerWidth} y1={0} y2={0} stroke='currentColor' />
            {xScale.ticks(5).map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)},0)`}>
                <line y2={6} stroke='currentColor' />
                <text
                  y={9}
                  dy='.71em'
                  textAnchor='middle'
                  className='text-sm fill-current'
                >
                  {formatValue(tick, usePercentSuffix)}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
