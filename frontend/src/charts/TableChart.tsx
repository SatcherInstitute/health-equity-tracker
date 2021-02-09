import React from "react";
import { Row } from "../data/DatasetTypes";
import { BreakdownVar } from "../data/Breakdowns";
import { MetricConfig } from "../data/MetricConfig";
import TableChartDataTable from '../dataset_explorer/TableChartDataTable';

export interface TableChartProps {
  data: Row[];
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
}

export function TableChart(props: TableChartProps) {
  return (
      <>
        {props.data.length <= 0 || props.metrics.length <= 0 ? (
          <h1>No Data provided</h1>
        ) : (<TableChartDataTable data={props.data} metrics={props.metrics} breakdownVar={props.breakdownVar} />)}
      </>
  );
}
