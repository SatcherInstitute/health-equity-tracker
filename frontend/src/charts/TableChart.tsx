import React from "react";
import { Paper } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Row } from "../data/DatasetTypes";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import { BreakdownVar, BREAKDOWN_VAR_DISPLAY_NAMES } from "../data/Breakdowns";
import { MetricConfig, formatFieldValue } from "../data/MetricConfig";

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
      ) : (
        <TableContainer component={Paper} style={{ maxHeight: "500px" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  {BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]}
                </TableCell>
                {props.metrics.map((metricConfig, i) => (
                  <TableCell key={i}>
                    {metricConfig.fullCardTitleName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row[props.breakdownVar]}</TableCell>
                  {props.metrics.map((metricConfig, j) => (
                    <TableCell key={j}>
                      {formatFieldValue(
                        metricConfig.type,
                        row[metricConfig.metricId]
                      )}
                      {(row[metricConfig.metricId] === null ||
                        row[metricConfig.metricId] === undefined) && (
                        <WarningRoundedIcon />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
