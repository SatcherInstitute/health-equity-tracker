import {
  formatFieldValue,
  type MetricConfig,
  type MetricId,
} from '../data/config/MetricConfig'
import {
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
  type BreakdownVar,
} from '../data/query/Breakdowns'
import { type DemographicGroup } from '../data/utils/Constants'
import { type Row } from '../data/utils/DatasetTypes'
import { type Fips } from '../data/utils/Fips'
import {
  CAWP_DETERMINANTS,
  getWomenRaceLabel,
} from '../data/providers/CawpProvider'

export type VisualizationType = 'chart' | 'map' | 'table'

export const PADDING_FOR_ACTIONS_MENU = 30

const MAX_LINE_LENGTH = 20

// ! &nbsp&nbsp NON BREAKABLE SPACES that shouldn't occur in the data labels and can therefore be used as a delimiter that reads naturally on a screen reader &nbsp
export const DELIMITER = '  '

export const ORDINAL = 'ordinal'

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
  field: BreakdownVar
): Row[] {
  return rawData.map((data) => {
    const lines = []
    let currentLine = ''
    for (const word of data[field].split(' ')) {
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
  omitPctSymbol: boolean = false
): [Row[], string] {
  const displayColName = metric.metricId + '__DISPLAY_' + String(omitPctSymbol)
  const newData = data.map((row) => {
    return {
      ...row,
      [displayColName]: formatFieldValue(
        metric.type,
        row[metric.metricId],
        omitPctSymbol
      ),
    }
  })

  return [newData, displayColName]
}

interface chartTitleProps {
  chartTitle: string
  currentBreakdown?: BreakdownVar
  fips: Fips
}

export function generateChartTitle({
  chartTitle,
  currentBreakdown,
  fips,
}: chartTitleProps): string {
  return `${chartTitle} ${
    currentBreakdown
      ? `with unknown ${BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]}`
      : ''
  } in ${fips.getSentenceDisplayName()}`
}

interface subtitleProps {
  activeBreakdownFilter: DemographicGroup
  currentBreakdown: BreakdownVar
  isPopulationSubset?: boolean
  metricId: MetricId
}

export function generateSubtitle({
  activeBreakdownFilter,
  currentBreakdown,
  isPopulationSubset,
  metricId,
}: subtitleProps) {
  let subtitle = ''

  if (activeBreakdownFilter === 'All') {
    subtitle = ''
  } else if (currentBreakdown === 'age') {
    subtitle = `Ages ${activeBreakdownFilter}`
  } else {
    subtitle = `${activeBreakdownFilter}`
  }

  if (isPopulationSubset) {
    let ageTitle = ''
    if (metricId === 'hiv_prep_coverage') {
      ageTitle = 'Ages 16+'
    } else if (metricId === 'hiv_stigma_index') {
      ageTitle = 'Ages 18+'
    }
  
    if (subtitle === '') {
      subtitle = ageTitle
    } else if (currentBreakdown !== 'age') {
      subtitle += `, ${ageTitle}`
    }
  }
  

  return subtitle
}

export function getAltGroupLabel(
  group: DemographicGroup,
  metricId: MetricId,
  breakdown: BreakdownVar
) {
  if (CAWP_DETERMINANTS.includes(metricId)) {
    return getWomenRaceLabel(group)
  }
  if (group === 'All' && breakdown === 'age') {
    if (metricId.includes('prep')) {
      return `${group} (16+)`
    }
    if (metricId.includes('stigma')) {
      return `${group} (18+)`
    }
    if (metricId.includes('hiv')) {
      return `${group} (13+)`
    }
    return group
  }
  return group
}
