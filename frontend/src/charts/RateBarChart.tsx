import { max, scaleBand, scaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import { isPctType } from '../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { sortForVegaByIncome } from '../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { addLineBreakDelimitersToField, addMetricDisplayColumn } from './utils'

// Constants
const BAR_PADDING = 0.2
const LABEL_SWAP_CUTOFF_PERCENT = 66
const MAX_LABEL_WIDTH = 100
const CORNER_RADIUS = 4
const MARGIN = { top: 20, right: 20, bottom: 50, left: MAX_LABEL_WIDTH + 40 }
const BAR_HEIGHT = 60 // Base height for single line
const EXTRA_SPACE_AFTER_ALL = 10 // Adjust this value to change the gap after "All"

interface RateBarChartProps {
  data: HetRow[]
  metricConfig: MetricConfig
  demographicType: DemographicType
  fips: Fips
  filename?: string
  usePercentSuffix?: boolean
  className?: string
  useIntersectionalComparisonAlls?: boolean
  comparisonAllSubGroup?: string
}

export function RateBarChart({
  data,
  metricConfig,
  demographicType,
}: RateBarChartProps) {
  const [containerRef, width] = useResponsiveWidth()

  // Data preprocessing with spacing calculation
  const processedData: HetRow[] = useMemo(() => {
    const processedRows = addLineBreakDelimitersToField(data, demographicType)
    const [rowsWithDisplayCol] = addMetricDisplayColumn(
      metricConfig,
      processedRows,
    )
    let [finalData] = addMetricDisplayColumn(
      metricConfig,
      rowsWithDisplayCol,
      true, // omitPctSymbol
    )

    if (demographicType === 'income') {
      finalData = sortForVegaByIncome(finalData)
    }

    // Add yIndex for positioning
    return finalData.map((row, index) => ({
      ...row,
      yIndex: row[demographicType] === 'All' ? -1 : index,
    }))
  }, [data, demographicType, metricConfig])

  // Prepare wrapped labels
  const wrappedLabels = useMemo(() => {
    return processedData.map((d) => ({
      original: d[demographicType],
      lines: wrapLabel(d[demographicType], MAX_LABEL_WIDTH),
    }))
  }, [processedData, demographicType])

  // Calculate dimensions
  const maxLines = Math.max(...wrappedLabels.map((label) => label.lines.length))
  const adjustedBarHeight = Math.max(BAR_HEIGHT, maxLines * 16)
  const allIndex = processedData.findIndex((d) => d[demographicType] === 'All')
  const totalExtraSpace = allIndex !== -1 ? EXTRA_SPACE_AFTER_ALL : 0
  const height =
    processedData.length * (adjustedBarHeight + 10) + totalExtraSpace
  const innerWidth = width - MARGIN.left - MARGIN.right
  const innerHeight = height - MARGIN.top - MARGIN.bottom

  // Scales
  const xScale = useMemo(() => {
    const maxValue = max(processedData, (d) => d[metricConfig.metricId]) || 0
    return scaleLinear().domain([0, maxValue]).range([0, innerWidth])
  }, [processedData, innerWidth, metricConfig.metricId])

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(processedData.map((d) => d[demographicType]))
      .range([0, innerHeight - totalExtraSpace]) // Adjust range to account for extra space
      .padding(BAR_PADDING)
  }, [processedData, innerHeight, totalExtraSpace])

  const getYPosition = (index: number, demographicValue: string) => {
    let position = yScale(demographicValue) || 0
    if (allIndex !== -1 && index > allIndex) {
      position += EXTRA_SPACE_AFTER_ALL
    }
    return position
  }

  const barLabelBreakpoint = useMemo(() => {
    const maxValue = max(processedData, (d) => d[metricConfig.metricId]) || 0
    return maxValue * (LABEL_SWAP_CUTOFF_PERCENT / 100)
  }, [processedData, metricConfig.metricId])

  return (
    <div ref={containerRef}>
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
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
              />
            ))}
          </g>
          {/* Y-axis label */}
          <text
            transform={`translate(${-MARGIN.left + 20},${innerHeight / 2}) rotate(-90)`}
            textAnchor='middle'
            className='text-smallest font-semibold p-0 m-0'
          >
            {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]}
          </text>
          {/* Y Axis */}
          <g className='y-axis'>
            {wrappedLabels.map((label, index) => {
              const yPosition = getYPosition(index, label.original)
              return (
                <g key={label.original} transform={`translate(0,${yPosition})`}>
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
              )
            })}
          </g>

          {/* Bars */}
          {processedData.map((d, index) => {
            const barWidth = xScale(d[metricConfig.metricId])
            const shouldLabelBeInside =
              d[metricConfig.metricId] > barLabelBreakpoint
            const yPosition = getYPosition(index, d[demographicType])

            return (
              <g
                key={d[demographicType]}
                transform={`translate(0,${yPosition})`}
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
                  className={`text-smallest ${
                    shouldLabelBeInside ? 'fill-white' : 'fill-current'
                  }`}
                >
                  {formatValue(d[metricConfig.metricId], metricConfig)}
                </text>
              </g>
            )
          })}

          {/* X-axis label */}
          <text
            transform={`translate(${innerWidth / 2},${innerHeight + 40})`}
            textAnchor='middle'
            className='text-smallest font-semibold'
          >
            {metricConfig.shortLabel}
          </text>
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
                  className='text-smallest fill-current'
                >
                  {tick}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}

function wrapLabel(text: string, width: number): string[] {
  const normalizedText = text.replace(/\s+/g, ' ').trim()
  const words = normalizedText.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length * 6 <= width) {
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

function formatValue(value: number, metricConfig: MetricConfig): string {
  if (metricConfig.type === 'per100k')
    return (
      Math.round(value).toLocaleString('en-US', {
        maximumFractionDigits: 1,
      }) + ' per 100k'
    )

  if (isPctType(metricConfig.type))
    return (
      value.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      }) + ' %'
    )

  return value.toLocaleString('en-US')
}
