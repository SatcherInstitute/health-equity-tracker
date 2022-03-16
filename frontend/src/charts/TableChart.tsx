import React, { useMemo } from "react";
import {
  Column,
  HeaderGroup,
  Row,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import Paper from "@material-ui/core/Paper";
import {
  MetricConfig,
  MetricId,
  formatFieldValue,
} from "../data/config/MetricConfig";
import {
  BREAKDOWN_VAR_DISPLAY_NAMES,
  BreakdownVar,
} from "../data/query/Breakdowns";
import { Tooltip, useMediaQuery } from "@material-ui/core";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import styles from "./Chart.module.scss";
import sass from "../styles/variables.module.scss";

export const MAX_NUM_ROWS_WITHOUT_PAGINATION = 20;

const headerCellStyle = {
  width: "200px",
  backgroundColor: sass.exploreBgColor,
};

const cellStyle = {
  width: "200px",
};

const altCellStyle = {
  backgroundColor: sass.greyGridColor,
  width: "200px",
};

export interface TableChartProps {
  data: Readonly<Record<string, any>>[];
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
}

export function TableChart(props: TableChartProps) {
  const wrap100kUnit = useMediaQuery("(max-width:500px)");

  const { data, metrics, breakdownVar } = props;
  let columns = metrics.map((metricConfig) => {
    return {
      Header: metricConfig.fullCardTitleName,
      Cell: (a: any) =>
        formatFieldValue(
          /* metricType: MetricType, */ metricConfig.type,
          /*   value: any, */ a.value,
          /*   omitPctSymbol: boolean = false */ metricConfig.type === "per100k"
        ),
      accessor: metricConfig.metricId,
    };
  });
  columns = [
    {
      Header: BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar],
      Cell: (cell: any) => cell.value,
      accessor: breakdownVar as MetricId,
    },
  ].concat(columns);

  // Changes deps array to columns on save, which triggers reload loop
  // eslint-disable-next-line
  const memoCols = useMemo<Column<any>[]>(() => columns, [metrics]);
  const memoData = useMemo(() => data, [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: memoCols,
      data: memoData,
      initialState: {
        pageSize: MAX_NUM_ROWS_WITHOUT_PAGINATION,
        sortBy: [
          {
            id: breakdownVar,
            desc: false,
          },
        ],
      },
    },
    useSortBy,
    usePagination
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
              <Tooltip title="Insufficient Data">
                <WarningRoundedIcon />
              </Tooltip>
              <span className={styles.ScreenreaderTitleHeader}>
                Insufficient Data
              </span>
            </TableCell>
          ) : (
            <TableCell
              {...cell.getCellProps()}
              style={row.index % 2 === 0 ? cellStyle : altCellStyle}
            >
              {cell.render("Cell")}
              <Units
                column={index}
                metric={props.metrics}
                wrap100kUnit={wrap100kUnit}
              />
            </TableCell>
          )
        )}
      </TableRow>
    );
  }

  return (
    <>
      {props.data.length <= 0 || props.metrics.length <= 0 ? (
        <h1>Insufficient Data</h1>
      ) : (
        <TableContainer component={Paper} style={{ maxHeight: "100%" }}>
          <Table stickyHeader {...getTableProps()}>
            <TableHead>
              {headerGroups.map((group, index) => (
                <TableHeaderRow group={group} key={index} />
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {page.map((row: Row<any>, index) => (
                <TableDataRow row={row} key={index} />
              ))}
            </TableBody>
            {/* If the number of rows is less than the smallest page size, we can hide pagination */}
            {props.data.length > MAX_NUM_ROWS_WITHOUT_PAGINATION && (
              <TableFooter>
                <TableRow>
                  <TablePagination
                    count={memoData.length}
                    rowsPerPage={pageSize}
                    page={pageIndex}
                    onPageChange={(event, newPage) => {
                      gotoPage(newPage);
                    }}
                    onChangeRowsPerPage={(event) => {
                      setPageSize(Number(event.target.value));
                    }}
                    rowsPerPageOptions={[
                      MAX_NUM_ROWS_WITHOUT_PAGINATION,
                      MAX_NUM_ROWS_WITHOUT_PAGINATION * 2,
                      MAX_NUM_ROWS_WITHOUT_PAGINATION * 5,
                    ]} // If changed, update pagination condition above
                  />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      )}
    </>
  );
}

interface UnitsProps {
  column: number;
  metric: MetricConfig[];
  wrap100kUnit: boolean;
}
function Units(props: UnitsProps) {
  if (!props.column) return null;

  const unit =
    props.metric[props.column - 1].type === "per100k" ? "per 100k" : "";

  // inline vs block
  return props.wrap100kUnit && props.column === 1 ? (
    <p className={styles.Unit}>{unit}</p>
  ) : (
    <span className={styles.Unit}>{unit}</span>
  );
}
