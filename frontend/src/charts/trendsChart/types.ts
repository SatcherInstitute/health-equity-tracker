import { ScaleTime, ScaleLinear, ScaleOrdinal } from "d3";
type GroupData = [string, [string, number][]];
type GroupValues = [string, number][];
type UnknownData = GroupValues;
type TrendsData = GroupData[];
type XScale = ScaleTime<number, number | undefined>;
type YScale = ScaleLinear<number, number | undefined>;
type ColorScale = ScaleOrdinal<string, string, never>;
type AxisConfig = { type: string; groupLabel: string; yAxisLabel?: string };

export type {
  TrendsData,
  GroupData,
  GroupValues,
  UnknownData,
  XScale,
  YScale,
  ColorScale,
  AxisConfig,
};
