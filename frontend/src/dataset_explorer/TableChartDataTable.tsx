import React from "react";
import {useTable, usePagination, useSortBy, Column} from "react-table";
import { Cell, HeaderGroup, Row } from "react-table";
import { Row as DataSetRow } from "../data/DatasetTypes";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import {formatFieldValue, MetricConfig} from '../data/MetricConfig';
import { BreakdownVar, BREAKDOWN_VAR_DISPLAY_NAMES } from "../data/Breakdowns";
import {Tooltip} from '@material-ui/core';
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';

/** Corollary for TableHeader **/
function NewTableHeader({ column }: { column: HeaderGroup<any> }) {
  return (
      <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
        {column.render("Header")}
        <TableSortLabel
            active={column.isSorted}
            direction={column.isSortedDesc ? "desc" : "asc"}
        />
      </TableCell>
  );
}

/** Corollary for TableHeaderGroup **/
function NewTableHeaderGroup({ group }: { group: HeaderGroup<any> }) {
  return (
      <TableRow {...group.getHeaderGroupProps()}>
        {group.headers.map((col, index) => (
            <NewTableHeader column={col} key={index} />
        ))}
      </TableRow>
  );
}

/** Corollary for CustomTableCell **/
function NewCustomTableCell({ cell }: { cell: Cell<any> }) {
  return <TableCell {...cell.getCellProps()}>{cell.render("Cell")}</TableCell>;


}

export interface DataTableProps {
  data: Readonly<Record<string, any>>[];
  metrics: MetricConfig[];
  breakdownVar: BreakdownVar;
}

function TableChartDataTable(props: DataTableProps) {
  const { data, metrics, breakdownVar } = props;
  let columns = metrics.map((metricConfig, i) => {
    return {
      Header: metricConfig.fullCardTitleName,
      accessor: (i+1).toString(),
    };
  });
  columns = [{
    Header: BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar],
    accessor: "0",
  }].concat(columns);

  const demoData = [
    {
      0: "Hi",
      1: "Hello",
      2: "Hi2",
      3: "Hi3",
      4: "Hello again",
    },
    {
      0: "Hi2",
      1: "Hello2",
      2: "Hi22",
      3: "Hi32",
      4: "Hello again 2",
    },
  ];

  const memoCols = React.useMemo<Column<any>[]>(() => columns, [columns]);
  const memoData = React.useMemo(() => demoData, [demoData]);

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

  function NewCustomTableRow({ row }: { row: Row<any> }) {
    prepareRow(row);
    return (
        <TableRow {...row.getRowProps()}>
          {row.cells.map((cell, index) => (
              <NewCustomTableCell cell={cell} key={index} />
          ))}
        </TableRow>
    );
  }

  function NewTableBody({data, metrics, breakdownVar}: { data: DataSetRow[], metrics: MetricConfig[], breakdownVar: BreakdownVar }) {
    return (
        <>
          {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row[breakdownVar]}</TableCell>
                {metrics.map((metricConfig, j) => (
                    <TableCell key={j}>
                      {formatFieldValue(
                          metricConfig.type,
                          row[metricConfig.metricId]
                      )}
                      {(row[metricConfig.metricId] === null ||
                          row[metricConfig.metricId] === undefined) && (
                          <Tooltip title="No data available">
                            <WarningRoundedIcon/>
                          </Tooltip>
                      )}
                    </TableCell>
                ))}
              </TableRow>
          ))}
        </>
    );
  }

  // debugger;

  return (
      <TableContainer component={Paper} style={{maxHeight: "500px"}}>
        <Table stickyHeader {...getTableProps()}>
          <TableHead>

            {headerGroups.map((group, index) => (
                <NewTableHeaderGroup group={group} key={index} />
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row: Row<any>, index) => (
                <NewCustomTableRow row={row} key={index} />
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
      </TableContainer>
  );

}

export default TableChartDataTable;
