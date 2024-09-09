import type {
  MetricConfig,
  MetricId,
} from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { ChartDimensionProps } from '../../utils/hooks/useChartDimensions'

type Data = Array<Record<string, any>>
type Text = string | string[]

export interface DisparityBarChartProps {
  demographicType: DemographicType
  data: Data
  darkMetric: MetricConfig
  lightMetric: MetricConfig
  filename: string
  metricDisplayName: string
  showAltPopCompare?: boolean
}

export interface AxesProps {
  chartDimensions: ChartDimensionProps
  xAxisTitle: Text
  yAxisTitle: Text
}

export interface MarkProps {
  barLabelBreakpoint: number
  demographicType: DemographicType
  data: Data
  hasAltPop: boolean
  altLightMeasure: MetricId
  altLightMeasureDisplayName: string
  altLightMetricDisplayColumnName: string
  darkMeasure: MetricId
  darkMeasureDisplayName: string
  darkMetricDisplayColumnName: string
  lightMeasure: MetricId
  lightMeasureDisplayName: string
  lightMetricDisplayColumnName: string
  LEGEND_DOMAINS: string[]
  darkMeasureText: string
}

export interface LegendsProps {
  chartDimensions: ChartDimensionProps
}

export interface ScalesProps {
  largerMeasure: MetricId
  demographicType: DemographicType
  LEGEND_DOMAINS: string[]
}
