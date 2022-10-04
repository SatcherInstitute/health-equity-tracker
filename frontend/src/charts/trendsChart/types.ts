import { ScaleTime, ScaleLinear, ScaleOrdinal } from "d3";
import { DemographicGroup } from "../../data/utils/Constants";
type Date = string;
type TrendsData = GroupData[];
type GroupData = [DemographicGroup, GroupValues];
type GroupValues = [Date, number][];
type UnknownData = GroupValues;
type XScale = ScaleTime<number, number | undefined>;
type YScale = ScaleLinear<number, number | undefined>;
type ColorScale = ScaleOrdinal<string, string, never>;
type AxisConfig = { type: string; groupLabel: string; yAxisLabel?: string };

export type {
  Date,
  TrendsData,
  GroupData,
  GroupValues,
  UnknownData,
  XScale,
  YScale,
  ColorScale,
  AxisConfig,
};
