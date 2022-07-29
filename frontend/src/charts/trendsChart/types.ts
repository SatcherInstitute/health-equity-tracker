import { ScaleTime, ScaleLinear, ScaleOrdinal } from "d3";
type TrendsData = [string, [Date, number][]][];
type UnknownData = [Date, number][];
type XScale = ScaleTime<number, number | undefined>;
type YScale = ScaleLinear<number, number | undefined>;
type ColorScale = ScaleOrdinal<string, string, never>;

export type { TrendsData, UnknownData, XScale, YScale, ColorScale };
