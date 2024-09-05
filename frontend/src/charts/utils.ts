import {
  type DataTypeConfig,
  formatFieldValue,
  type MetricConfig,
} from '../data/config/MetricConfig'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { AGE, ALL, type DemographicGroup } from '../data/utils/Constants'
import type { Row } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'

export type VisualizationType = 'chart' | 'map' | 'table'
export const PADDING_FOR_ACTIONS_MENU = 30
const MAX_LINE_LENGTH = 20

export const CORNER_RADIUS = 3

// ! &nbsp&nbsp NON BREAKABLE SPACES that shouldn't occur in the data labels and can therefore be used as a delimiter that reads naturally on a screen reader &nbsp
export const DELIMITER = '  '

// Returns a Vega Expression to create an array of the multiple lines in the label
export const MULTILINE_LABEL = `split(datum.value, '${DELIMITER}')`

// Returns a Vega Expression to create replace delimiter token with a normal space for displaying the label on single line label
export function oneLineLabel(field: string) {
  return `join(split(datum.${field}, '${DELIMITER}'), ' ')`
}

// We use nested ternaries to determine the label's y axis delta based on the number of lines in the label to vertically align
export const AXIS_LABEL_Y_DELTA = `length(${MULTILINE_LABEL}) == 2 ? -3 : length(${MULTILINE_LABEL}) > 2 ? -20 : 5`

export const LABEL_HEIGHT = `length(${MULTILINE_LABEL}) > 2 ? 9 : 10`

export function addLineBreakDelimitersToField(
  rawData: Row[],
  field: DemographicType,
): Row[] {
  return rawData.map((data) => {
    const lines = []
    let currentLine = ''
    const words = data[field]?.split(' ') ?? []

    for (const word of words) {
      if (word.length + currentLine.length >= MAX_LINE_LENGTH) {
        lines.push(currentLine.trim())
        currentLine = word + ' '
      } else {
        currentLine += word + ' '
      }
    }
    lines.push(currentLine.trim())
    return { ...data, [field]: lines.join(DELIMITER) }
  })
}

/**
 * Adds a display column to the data with the formatted values. This allows Vega
 * to directly reference the display column for labels and tooltips rather than
 * relying on formatting expression strings.
 * @param metric The metric to add the display column for.
 * @param data The data to add the column for.
 * @param omitPctSymbol Whether to omit the % symbol if the metric is a %. This
 *     can be used for example if the % symbol is part of the description.
 * @returns A tuple of
 *     [
 *         The data with the new display column,
 *         the name of the new display column
 *     ]
 */
export function addMetricDisplayColumn(
  metric: MetricConfig,
  data: Row[],
  omitPctSymbol: boolean = false,
): [Row[], string] {
  const displayColName = metric.metricId + '__DISPLAY_' + String(omitPctSymbol)
  const newData = data.map((row) => {
    return {
      ...row,
      [displayColName]: formatFieldValue(
        metric.type,
        row[metric.metricId],
        omitPctSymbol,
      ),
    }
  })

  return [newData, displayColName]
}

export function generateChartTitle(
  chartTitle: string,
  fips: Fips,
  demographicType?: DemographicType,
): string {
  return `${chartTitle}${
    demographicType
      ? ` with unknown ${DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]}`
      : ''
  } in ${fips.getSentenceDisplayName()}`
}

export function generateSubtitle(
  activeDemographicGroup: DemographicGroup,
  demographicType: DemographicType,
  dataTypeConfig: DataTypeConfig,
) {
  // active group label, if any
  let activeGroupLabel = ''
  if (activeDemographicGroup === ALL) {
    activeGroupLabel = ''
  } else if (demographicType === AGE) {
    activeGroupLabel = `Ages ${activeDemographicGroup}`
  } else if (demographicType === 'urbanicity') {
    activeGroupLabel = `Living in ${activeDemographicGroup} areas`
  } else {
    activeGroupLabel = activeDemographicGroup
  }

  // age and any other subpopulations, if any
  const ageSubPop =
    demographicType === AGE && activeDemographicGroup !== ALL
      ? ''
      : dataTypeConfig?.ageSubPopulationLabel ?? ''
  const otherSubPop = dataTypeConfig?.otherSubPopulationLabel ?? ''

  // combine as needed to create specific population subtitle
  const subtitle = [otherSubPop, activeGroupLabel, ageSubPop]
    .filter(Boolean)
    .join(', ')

  return subtitle
}

export function removeLastS(inputString: string) {
  // Use a regular expression to replace the last "s" with an empty string
  return inputString.replace(/s$/, '')
}

// Returns an options object for toLocaleString() that will round larger 100k numbers to whole numbers, but allow 1 decimal place for numbers under 10 and 2 decimal places for numbers under 1
export const getFormatterPer100k = (value: number) => {
  const numDecimalPlaces = value < 10 ? 1 : 0
  return {
    minimumFractionDigits: numDecimalPlaces,
    maximumFractionDigits: numDecimalPlaces,
  }
}
