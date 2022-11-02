import { MetricConfig, MetricId } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { ChartDimensionProps } from "../../utils/hooks/useChartDimensions";

type Data = Record<string, any>[];

export interface DisparityBarChartCardProps {
  breakdownVar: BreakdownVar;
  chartTitle?: string | string[];
  data: Data;
  darkMetric: MetricConfig;
  filename: string;
  lightMetric: MetricConfig;
  metricDisplayName: string;
  stacked?: boolean;
  showAltPopCompare?: boolean;
}

export interface AxesProps {
  chartDimensions: ChartDimensionProps;
  xAxisTitle: string | string[];
  yAxisTitle: string | string[];
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

export interface Spec {
  data: Record<string, any>[];
  chartTitle?: string | string[];
  filename: string;
  fontSize: number;
  title: {
    text: string | string[];
    subTitle?: string;
    encode: {
      title: {
        enter: {
          fontSize: { value: number };
          font: { value: string };
        };
      };
    };
  };
  width: number;
}

export interface getTitleProps {
  chartTitle?: string | string[];
  fontSize: number;
}
