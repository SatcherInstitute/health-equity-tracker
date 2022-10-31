import { Row } from "react-table";
import { MetricConfig } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";

export interface DisparityBarChartCardProps {
  breakdownVar: BreakdownVar;
  chartTitle?: string | string[];
  data: Readonly<Record<string, any>>[];
  darkMetric: MetricConfig;
  filename: string;
  lightMetric: MetricConfig;
  metricDisplayName: string;
  stacked?: boolean;
  showAltPopCompare?: boolean;
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

export interface MarkProps {
  data: Readonly<Record<string, any>>[];
  breakdownVar: BreakdownVar;
  lightMetric: MetricConfig;
  darkMetric: MetricConfig;
  hasAltPop: boolean;
  stacked?: boolean;
  chartIsSmall: boolean;
  metricDisplayName: string;
}
