import { Vega } from 'react-vega'
import type { HetRow } from '../data/utils/DatasetTypes'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import {
  type DemographicType,
  type DemographicTypeDisplayName,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import type { MetricConfig, MetricId } from '../data/config/MetricConfigTypes'
import {
  addLineBreakDelimitersToField,
  MULTILINE_LABEL,
  AXIS_LABEL_Y_DELTA,
  oneLineLabel,
  addMetricDisplayColumn,
  PADDING_FOR_ACTIONS_MENU,
  LABEL_HEIGHT,
  CORNER_RADIUS,
} from './utils'
import { createBarLabel } from './mapHelperFunctions'
import { het, ThemeZIndexValues } from '../styles/DesignTokens'
import { sortForVegaByIncome } from '../data/sorting/IncomeSorterStrategy'
import { getSpec } from './simpleBarHelperFunctions'

// determine where (out of 100) to flip labels inside/outside the bar
const LABEL_SWAP_CUTOFF_PERCENT = 66

interface SimpleHorizontalBarChartProps {
  data: HetRow[]
  metric: MetricConfig
  demographicType: DemographicType
  filename?: string
  usePercentSuffix?: boolean
  className?: string
}

export function SimpleHorizontalBarChart(props: SimpleHorizontalBarChartProps) {
  const [ref, width] = useResponsiveWidth()

  const dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    props.data,
    props.demographicType,
  )
  const [dataWithDisplayCol] = addMetricDisplayColumn(
    props.metric,
    dataWithLineBreakDelimiter,
  )
  // Omit the % symbol for the tooltip because it's included in shortLabel.
  let [data, tooltipMetricDisplayColumnName] = addMetricDisplayColumn(
    props.metric,
    dataWithDisplayCol,
    /* omitPctSymbol= */ true,
  )

  if (props.demographicType === 'income') {
    data = sortForVegaByIncome(data)
  }

  const barLabelBreakpoint =
    Math.max(...props.data.map((row) => row[props.metric.metricId])) *
    (LABEL_SWAP_CUTOFF_PERCENT / 100)

  return (
    <div ref={ref}>
      <Vega
        renderer='svg'
        downloadFileName={`${
          props.filename ?? 'Data Download'
        } - Health Equity Tracker`}
        spec={getSpec(
          /* altText  */ `Bar Chart showing ${
            props.filename ?? 'Data Download'
          }`,
          /* data  */ data,
          /* width  */ width,
          /* demographicType  */ props.demographicType,
          /* demographicTypeDisplayName  */ DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[
            props.demographicType
          ],
          /* measure  */ props.metric.metricId,
          /* measureDisplayName  */ props.metric.shortLabel,
          /* tooltipMetricDisplayColumnName  */ tooltipMetricDisplayColumnName,
          /* showLegend  */ false,
          /* barLabelBreakpoint  */ barLabelBreakpoint,
          /* usePercentSuffix  */ props.usePercentSuffix ?? false,
        )}
        actions={false}
      />
    </div>
  )
}
