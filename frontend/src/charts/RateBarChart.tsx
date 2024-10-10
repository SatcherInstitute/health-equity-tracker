import { max, scaleBand, scaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import { isPctType, isRateType } from '../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { sortForVegaByIncome } from '../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { addLineBreakDelimitersToField, addMetricDisplayColumn } from './utils'

// Constants
const BAR_PADDING = 0.2
const LABEL_SWAP_CUTOFF_PERCENT = 66
const MAX_LABEL_WIDTH_BIG = 100
const MAX_LABEL_WIDTH_SMALL = 50
const CORNER_RADIUS = 4
const MARGIN = { top: 20, right: 20, bottom: 50, left: 0 }
const BAR_HEIGHT = 70
const EXTRA_SPACE_AFTER_ALL = 10

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
  fips,
  metricConfig,
  demographicType,
  useIntersectionalComparisonAlls,
  comparisonAllSubGroup,
}: RateBarChartProps) {
  const smallerDemographicLabelTypes: DemographicType[] = [
    'sex',
    'age',
    'insurance_status',
  ]

  const [containerRef, width] = useResponsiveWidth()

  const numTicks = getNumTicks(width)

  const maxLabelWidth = smallerDemographicLabelTypes.includes(demographicType)
    ? MAX_LABEL_WIDTH_SMALL
    : MAX_LABEL_WIDTH_BIG
  MARGIN.left = maxLabelWidth + 40

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
      lines: wrapLabel(d[demographicType], maxLabelWidth),
    }))
  }, [processedData, demographicType])

  const allIndex = processedData.findIndex((d) => d[demographicType] === 'All')
  const totalExtraSpace = allIndex !== -1 ? EXTRA_SPACE_AFTER_ALL : 0
  const height = processedData.length * (BAR_HEIGHT + 10) + totalExtraSpace
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
            {xScale.ticks(numTicks).map((tick) => (
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
          {/* Y-axis DemographicType label */}
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
              if (label.original === 'All' && useIntersectionalComparisonAlls) {
                label.lines = getComparisonAllSubGroupLines(
                  fips,
                  comparisonAllSubGroup,
                )
              }
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
                        lineIndex * 12
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

            const barLabelColor =
              shouldLabelBeInside && d[demographicType] !== 'All'
                ? 'fill-white'
                : 'fill-current'

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
                {/* Bar Label */}
                <text
                  x={shouldLabelBeInside ? barWidth - 5 : barWidth + 5}
                  y={yScale.bandwidth() / 2}
                  dy='1.3em'
                  textAnchor={shouldLabelBeInside ? 'end' : 'start'}
                  className={`text-smallest ${barLabelColor}`}
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
  // set maxFractionDigits to:
  // 0 if number isRateType() and over 10
  // 1 if number isRateType() and under 10 and over 1
  // 2 if number isRateType() and under 1
  // 1 if number isPctType()

  let maxFractionDigits = 1
  if (isRateType(metricConfig.type)) {
    if (value > 10) maxFractionDigits = 0
    else if (value > 1) maxFractionDigits = 1
    else if (value > 0.1) maxFractionDigits = 2
  }

  if (metricConfig.type === 'per100k')
    return (
      Math.round(value).toLocaleString('en-US', {
        maximumFractionDigits: maxFractionDigits,
      }) + ' per 100k'
    )

  if (isPctType(metricConfig.type))
    return (
      value.toLocaleString('en-US', {
        maximumFractionDigits: maxFractionDigits,
      }) + '%'
    )

  return value.toLocaleString('en-US')
}

function getNumTicks(width: number): number {
  const isSmMd = useIsBreakpointAndUp('smMd')
  const isCompareMode = window.location.href.includes('compare')
  let numTicks = Math.floor(width / 40)
  if (isCompareMode || !isSmMd) {
    numTicks = Math.max(Math.floor(numTicks / 1.5), 5)
  }
  return numTicks
}

function getComparisonAllSubGroupLines(
  fips: Fips,
  comparisonAllSubGroup?: string,
) {
  const lines: string[] = [
    fips.getUppercaseFipsTypeDisplayName() || '',
    'Average',
    'All People',
  ]

  if (comparisonAllSubGroup) {
    lines.push(comparisonAllSubGroup)
  }
  return lines
}
