import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { isPctType, isRateType } from '../../data/config/MetricConfigUtils'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { ALL } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

function wrapLabel(text: string, width: number): string[] {
  if (!text) return []
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

function formatValue(
  value: number,
  metricConfig: MetricConfig,
  isTinyAndUp: boolean,
): string {
  let maxFractionDigits = 1
  if (isRateType(metricConfig.type)) {
    if (value > 10) maxFractionDigits = 0
    else if (value > 1) maxFractionDigits = 1
    else if (value > 0.1) maxFractionDigits = 2
  }

  if (metricConfig.type === 'per100k') {
    const roundedVal = Math.round(value).toLocaleString('en-US', {
      maximumFractionDigits: maxFractionDigits,
    })
    return isTinyAndUp ? roundedVal + ' per 100k' : roundedVal
  }

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
interface RoundedBarOptions {
  width: number
  height?: number
  yPosition?: number
  barHeight?: number
  cornerRadius?: number
}

function buildRoundedBarString({
  width,
  height,
  yPosition = 0,
  barHeight,
  cornerRadius = 4,
}: RoundedBarOptions): string {
  const safeWidth = Math.max(0, width)
  const safeRadius = Math.min(cornerRadius, safeWidth / 2)
  const effectiveHeight = height || barHeight || 0

  if (safeWidth <= 0 || effectiveHeight <= 0) return ''

  // If yPosition is provided, use absolute positioning
  if (yPosition !== undefined && barHeight !== undefined) {
    return `
      M 0,${yPosition}
      L ${safeWidth - safeRadius},${yPosition}
      Q ${safeWidth},${yPosition} ${safeWidth},${yPosition + safeRadius}
      L ${safeWidth},${yPosition + effectiveHeight - safeRadius}
      Q ${safeWidth},${yPosition + effectiveHeight} ${safeWidth - safeRadius},${yPosition + effectiveHeight}
      L 0,${yPosition + effectiveHeight}
      Z
    `.trim()
  }

  // Otherwise use relative positioning
  return `
    M 0,0
    h ${safeWidth - safeRadius}
    q ${safeRadius},0 ${safeRadius},${safeRadius}
    v ${effectiveHeight - 2 * safeRadius}
    q 0,${safeRadius} -${safeRadius},${safeRadius}
    h -${safeWidth - safeRadius}
    Z
  `.trim()
}

export function buildBarPair(
  lightValue: number,
  darkValue: number,
  yPosition: number,
  barHeight: number,
  pairGap: number,
  xScale: (value: number) => number,
) {
  const lightBar = buildRoundedBarString({
    width: xScale(lightValue || 0),
    yPosition,
    barHeight,
  })

  const darkBar = buildRoundedBarString({
    width: xScale(darkValue || 0),
    yPosition: yPosition + barHeight + pairGap,
    barHeight,
  })

  return { lightBar, darkBar }
}

function addComparisonAllsRowToIntersectionalData(
  data: HetRow[],
  demographicType: DemographicType,
  rateConfig: MetricConfig,
  rateComparisonConfig: MetricConfig,
  rateQueryResponseRateAlls: MetricQueryResponse,
) {
  // rename intersectional 'All' group
  const adjustedData = data.map((row) => {
    const renameRow = { ...row }
    if (row[demographicType] === ALL) {
      renameRow[demographicType] = rateComparisonConfig?.shortLabel
    }
    return renameRow
  })

  // add the comparison ALLs row to the intersectional data
  const originalAllsRow = rateQueryResponseRateAlls?.data?.[0]

  if (!originalAllsRow) {
    return adjustedData
  }

  const { fips, fips_name } = originalAllsRow

  const allsRow = {
    fips,
    fips_name,
    [demographicType]: ALL,
    [rateConfig.metricId]:
      originalAllsRow[rateConfig?.rateComparisonMetricForAlls?.metricId ?? ''],
  }
  adjustedData.unshift(allsRow)

  return adjustedData
}

export {
  addComparisonAllsRowToIntersectionalData,
  buildRoundedBarString,
  formatValue,
  getComparisonAllSubGroupLines,
  getNumTicks,
  wrapLabel,
}
