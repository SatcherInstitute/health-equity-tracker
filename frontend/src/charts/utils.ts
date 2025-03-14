import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { AGE, ALL, type DemographicGroup } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'

export type VisualizationType = 'chart' | 'map' | 'table'

export const HEIGHT_WIDTH_RATIO = 0.7
export const X_AXIS_MAX_TICKS = 12
export const X_AXIS_MAX_TICKS_SKINNY = 5

// ! &nbsp&nbsp NON BREAKABLE SPACES that shouldn't occur in the data labels and can therefore be used as a delimiter that reads naturally on a screen reader &nbsp

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
  const activeGroupLabel = getDemographicGroupLabel(
    demographicType,
    activeDemographicGroup,
  )

  // age and any other subpopulations, if any
  const ageSubPop =
    demographicType === AGE && activeDemographicGroup !== ALL
      ? ''
      : (dataTypeConfig?.ageSubPopulationLabel ?? '')
  const otherSubPop = dataTypeConfig?.otherSubPopulationLabel ?? ''

  // combine as needed to create specific population subtitle
  const subtitle = [otherSubPop, activeGroupLabel, ageSubPop]
    .filter(Boolean)
    .join(', ')

  return subtitle
}

export function getDemographicGroupLabel(
  demographicType: DemographicType,
  demographicGroup: DemographicGroup,
) {
  let groupLabel = ''
  if (demographicGroup === ALL) {
    groupLabel = ''
  } else if (demographicType === AGE) {
    groupLabel = `Ages ${demographicGroup}`
  } else if (demographicType === 'urbanicity') {
    groupLabel = `Living in ${demographicGroup} areas`
  } else {
    groupLabel = demographicGroup
  }
  return groupLabel
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
