import React, {useMemo} from "react";
import {Column, HeaderGroup, Row, usePagination, useSortBy, useTable} from "react-table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import {MetricConfig, MetricId} from '../data/config/MetricConfig';
import {BREAKDOWN_VAR_DISPLAY_NAMES, BreakdownVar} from '../data/query/Breakdowns';
import {Tooltip} from '@material-ui/core';
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';

export interface TableChartProps {
  data: Readonly<Record<string, any>>[];
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
}

export function TableChart(props: TableChartProps) {
  const {data, metrics, breakdownVar} = props;
  let columns = metrics.map((metricConfig) => {
    return {
      Header: metricConfig.fullCardTitleName,
      accessor: metricConfig.metricId,
    };
  });
  columns = [{
    Header: BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar],
    accessor: breakdownVar as MetricId,
  }].concat(columns);

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
    state: {pageIndex, pageSize},
  } = useTable(
      {
        columns: memoCols,
        data: memoData,
        initialState: {pageSize: 5},
      },
      useSortBy,
      usePagination
  );

  /** Component for the table's header row **/
  function TableHeaderRow({group}: { group: HeaderGroup<any> }) {
    return (
        <TableRow {...group.getHeaderGroupProps()}>
          {group.headers.map((col, index) => (
              <TableCell {...col.getHeaderProps(col.getSortByToggleProps())}>
                {col.render("Header")}
                <TableSortLabel
                    active={col.isSorted}
                    direction={col.isSortedDesc ? "desc" : "asc"}
                />
              </TableCell>
          ))}
        </TableRow>
    );
  }

  /** Component for the table's data rows **/
  function TableDataRow({row}: { row: Row<any> }) {
    prepareRow(row);
    return (
        <TableRow {...row.getRowProps()}>
          {row.cells.map((cell, index) => (
              cell.value == null ?
                  <TableCell {...cell.getCellProps()}>
                    <Tooltip title="No data available">
                      <WarningRoundedIcon/>
                    </Tooltip>
                  </TableCell>
                  :
                  <TableCell {...cell.getCellProps()}>
                    {cell.render("Cell")}{cell.column.id.includes("_pct") &&
                  <span>%</span>}
                  </TableCell>
          ))}
        </TableRow>
    );
  }

  return (
      <>
        {props.data.length <= 0 || props.metrics.length <= 0 ? (
          <h1>No Data provided</h1> ) :
            (<TableContainer component={Paper} style={{maxHeight: "500px"}}>
              <Table stickyHeader {...getTableProps()}>
                <TableHead>
                  {headerGroups.map((group, index) => (
                      <TableHeaderRow group={group} key={index}/>
                  ))}
                </TableHead>
                <TableBody {...getTableBodyProps()}>
                  {page.map((row: Row<any>, index) => (
                      <TableDataRow row={row} key={index}/>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                        count={memoData.length}
                        rowsPerPage={pageSize}
                        page={pageIndex}
                        onChangePage={(event, newPage) => {
                          gotoPage(newPage);
                        }}
                        onChangeRowsPerPage={(event) => {
                          setPageSize(Number(event.target.value));
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>)}
      </>
  );
}
