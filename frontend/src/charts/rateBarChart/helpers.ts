import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { isPctType, isRateType } from '../../data/config/MetricConfigUtils'
import type { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

export function wrapLabel(text: string, width: number): string[] {
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

export function formatValue(value: number, metricConfig: MetricConfig): string {
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

export function getNumTicks(width: number): number {
  const isSmMd = useIsBreakpointAndUp('smMd')
  const isCompareMode = window.location.href.includes('compare')
  let numTicks = Math.floor(width / 40)
  if (isCompareMode || !isSmMd) {
    numTicks = Math.max(Math.floor(numTicks / 1.5), 5)
  }
  return numTicks
}

export function getComparisonAllSubGroupLines(
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

export function buildRoundedBarString(barWidth: number, yScale: any) {
  const CORNER_RADIUS = 4

  const safeBarWidth = Math.max(0, barWidth)
  const safeCornerRadius = Math.min(CORNER_RADIUS, safeBarWidth / 2)
  const safeBandwidth = yScale.bandwidth() || 0
  if (safeBarWidth <= 0 || safeBandwidth <= 0) return ''

  return `
					M 0,0
					h ${safeBarWidth - safeCornerRadius}
					q ${safeCornerRadius},0 ${safeCornerRadius},${safeCornerRadius}
					v ${safeBandwidth - 2 * safeCornerRadius}
					q 0,${safeCornerRadius} -${safeCornerRadius},${safeCornerRadius}
					h -${safeBarWidth - safeCornerRadius}
					Z
				`
}
