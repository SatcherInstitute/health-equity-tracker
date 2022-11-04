import React, { useMemo } from "react";
import { Column, HeaderGroup, Row, useSortBy, useTable } from "react-table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableFooter from "@material-ui/core/TableFooter";
import Paper from "@material-ui/core/Paper";
import {
  MetricConfig,
  MetricId,
  formatFieldValue,
} from "../data/config/MetricConfig";
import { BREAKDOWN_VAR_DISPLAY_NAMES } from "../data/query/Breakdowns";
import { Tooltip } from "@material-ui/core";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import styles from "./Chart.module.scss";
import sass from "../styles/variables.module.scss";
import { RACE } from "../data/utils/Constants";
import { useFontSize } from "../utils/hooks/useFontSize";

const headerCellStyle = {
  width: "200px",
  backgroundColor: sass.footerColor,
};

const cellStyle = {
  width: "200px",
};

const altCellStyle = {
  backgroundColor: sass.greyGridColor,
  width: "200px",
};

export interface AgeAdjustedTableChartProps {
  data: Readonly<Record<string, any>>[];
  metrics: MetricConfig[];
  title?: string | string[];
}

export function AgeAdjustedTableChart(props: AgeAdjustedTableChartProps) {
  const { data, metrics } = props;

  let columns = metrics.map((metricConfig) => {
    return {
      Header: metricConfig.shortLabel,
      Cell: (a: any) =>
        formatFieldValue(
          /* metricType: MetricType, */ metricConfig.type,
          /*   value: any, */ a.value,
          /*   omitPctSymbol: boolean = false */ true
        ),
      accessor: metricConfig.metricId,
    };
  });
  columns = [
    {
      Header: BREAKDOWN_VAR_DISPLAY_NAMES[RACE],
      Cell: (cell: any) => cell.value,
      accessor: RACE as MetricId,
    },
  ].concat(columns);

  // Changes deps array to columns on save, which triggers reload loop
  // eslint-disable-next-line
  const memoCols = useMemo<Column<any>[]>(() => columns, [metrics]);
  const memoData = useMemo(() => data, [data]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns: memoCols,
        data: memoData,
        initialState: {
          sortBy: [
            {
              id: RACE,
              desc: false,
            },
          ],
        },
      },
      useSortBy
    );

  /** Component for the table's header row **/
  function TableHeaderRow({ group }: { group: HeaderGroup<any> }) {
    return (
      <TableRow {...group.getHeaderGroupProps()}>
        {group.headers.map((col, index) => (
          <TableCell key={col.id} style={headerCellStyle}>
            {col.render("Header")}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  /** Component for the table's data rows **/
  function TableDataRow({ row }: { row: Row<any> }) {
    prepareRow(row);
    return (
      <TableRow {...row.getRowProps()}>
        {row.cells.map((cell, index) =>
          cell.value == null ? (
            <TableCell
              {...cell.getCellProps()}
              style={row.index % 2 === 0 ? cellStyle : altCellStyle}
            >
              <Tooltip title="No data available">
                <WarningRoundedIcon />
              </Tooltip>
              <span className={styles.ScreenreaderTitleHeader}>
                No Data Available
              </span>
            </TableCell>
          ) : (
            <TableCell
              {...cell.getCellProps()}
              style={row.index % 2 === 0 ? cellStyle : altCellStyle}
            >
              {cell.render("Cell")}
            </TableCell>
          )
        )}
      </TableRow>
    );
  }

  const fontSize = useFontSize();

  const titleStyle = {
    font: "Inter, sans-serif",
    fontSize: fontSize,
    fontWeight: "bold",
  };

  return (
    <>
      {props.data.length <= 0 || props.metrics.length <= 0 ? (
        <h1>No Data provided</h1>
      ) : (
        <>
          <div style={titleStyle}>{props.title}</div>
          <TableContainer component={Paper} style={{ maxHeight: "100%" }}>
            <Table stickyHeader {...getTableProps()}>
              <TableHead>
                {headerGroups.map((group, index) => (
                  <TableHeaderRow group={group} key={index} />
                ))}
              </TableHead>
              <TableBody {...getTableBodyProps()}>
                {rows.map((row: Row<any>, index) => (
                  <TableDataRow row={row} key={index} />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow />
              </TableFooter>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
}
