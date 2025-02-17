import type { ScaleLinear, ScaleOrdinal, ScaleTime } from 'd3'
import type {
  MetricType,
  TimeSeriesCadenceType,
} from '../../data/config/MetricConfigTypes'
import type { DemographicGroup } from '../../data/utils/Constants'

type TrendsData = GroupData[]
type GroupData = [DemographicGroup, TimeSeries]
type UnknownData = TimeSeries
type TimeSeries = DataPoint[]
type DataPoint = [Date, number]
type Date = string

type XScale = ScaleTime<number, number | undefined>
type YScale = ScaleLinear<number, number | undefined>
type ColorScale = ScaleOrdinal<string, string, never>

interface AxisConfig {
  type: MetricType
  groupLabel: DemographicGroup
  yAxisLabel?: string
  xAxisTimeSeriesCadence?: TimeSeriesCadenceType
  xAxisMaxTicks?: number | null
}

export type {
  
  
  TrendsData,
  GroupData,
  TimeSeries,
  UnknownData,
  XScale,
  YScale,
  
  AxisConfig,
}
