import {
  MetricConfig,
  MetricId,
  VariableConfig,
} from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { ChartDimensionProps } from "../../utils/hooks/useChartDimensions";

type Data = Record<string, any>[];
type Text = string | string[];

export interface DisparityBarChartProps {
  breakdownVar: BreakdownVar;
  chartTitle?: Text;
  data: Data;
  darkMetric: MetricConfig;
  lightMetric: MetricConfig;
  filename: string;
  metricDisplayName: string;
  showAltPopCompare?: boolean;
}

export interface AxesProps {
  chartDimensions: ChartDimensionProps;
  xAxisTitle: Text;
  yAxisTitle: Text;
}

export interface MarkProps {
  barLabelBreakpoint: number;
  breakdownVar: BreakdownVar;
  data: Data;
  hasAltPop: boolean;
  altLightMeasure: MetricId;
  altLightMeasureDisplayName: string;
  altLightMetricDisplayColumnName: string;
  darkMeasure: MetricId;
  darkMeasureDisplayName: string;
  darkMetricDisplayColumnName: string;
  lightMeasure: MetricId;
  lightMeasureDisplayName: string;
  lightMetricDisplayColumnName: string;
  LEGEND_DOMAINS: string[];
  metricDisplayName: string;
}

export interface LegendsProps {
  chartDimensions: ChartDimensionProps;
}

export interface ScalesProps {
  largerMeasure: MetricId;
  breakdownVar: BreakdownVar;
  LEGEND_DOMAINS: string[];
}

export interface getTitleProps {
  chartTitle?: string | string[];
  fontSize: number;
}
