import { ScaleTime, ScaleLinear, ScaleOrdinal } from "d3";
import { MetricType } from "../../data/config/MetricConfig";
import { DemographicGroup } from "../../data/utils/Constants";

type TrendsData = GroupData[];
type GroupData = [DemographicGroup, TimeSeries];
type UnknownData = TimeSeries;
type TimeSeries = DataPoint[];
type DataPoint = [Date, number];
type Date = string;

type XScale = ScaleTime<number, number | undefined>;
type YScale = ScaleLinear<number, number | undefined>;
type ColorScale = ScaleOrdinal<string, string, never>;
type AxisConfig = {
  type: MetricType;
  groupLabel: DemographicGroup;
  yAxisLabel?: string;
};

export type {
  Date,
  DataPoint,
  TrendsData,
  GroupData,
  TimeSeries,
  UnknownData,
  XScale,
  YScale,
  ColorScale,
  AxisConfig,
};
