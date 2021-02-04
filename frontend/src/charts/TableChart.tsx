import React from "react";
import { Paper } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import { Row } from "../data/DatasetTypes";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import { BreakdownVar, BREAKDOWN_VAR_DISPLAY_NAMES } from "../data/Breakdowns";
import { MetricConfig, formatFieldValue } from "../data/MetricConfig";
import TableChartDataTable from '../dataset_explorer/TableChartDataTable';
import DataTable from '../dataset_explorer/DataTable';

export interface TableChartProps {
  data: Row[];
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
}

export function TableChart(props: TableChartProps) {

  const demoColumns = [
    {
      Header: 'Hello',
      accessor: '1',
    },
    {
      Header: 'Hello2',
      accessor: '2',
    },
  ];
  const demoData = [
    {
      1: 'Hello world',
      2: 'Hello world 2',
    },
    {
      1: 'Hello world 3',
      2: 'Hello world 4',
    },
  ];

  return (
      <>
        {props.data.length <= 0 || props.metrics.length <= 0 ? (
          <h1>No Data provided</h1>
        ) : (<TableChartDataTable data={props.data} metrics={props.metrics} breakdownVar={props.breakdownVar} />)}
        {/* ) : (<DataTable columns={demoColumns} data={demoData}/>)}*/}

      </>

  );
}
