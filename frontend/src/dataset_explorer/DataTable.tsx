import React from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { Cell, HeaderGroup, Row } from "react-table";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import styles from "./DataTable.module.scss";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";

function TableHeader({ column }: { column: HeaderGroup<any> }) {
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

function TableHeaderGroup({ group }: { group: HeaderGroup<any> }) {
  return (
    <TableRow {...group.getHeaderGroupProps()}>
      {group.headers.map((col, index) => (
        <TableHeader column={col} key={index} />
      ))}
    </TableRow>
  );
}

function CustomTableCell({ cell }: { cell: Cell<any> }) {
  return <TableCell {...cell.getCellProps()}>{cell.render("Cell")}</TableCell>;
}

function DataTable(props: { columns: any[]; data: any[] }) {
  const { columns, data } = props;
  const memoCols = React.useMemo(() => columns, [columns]);
  const memoData = React.useMemo(() => data, [data]);

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
      initialState: { pageSize: 5 },
    },
    useSortBy,
    usePagination
  );

  function CustomTableRow({ row }: { row: Row<any> }) {
    prepareRow(row);
    return (
      <TableRow {...row.getRowProps()}>
        {row.cells.map((cell, index) => (
          <CustomTableCell cell={cell} key={index} />
        ))}
      </TableRow>
    );
  }

  return (
    <Paper className={styles.DataTable}>
      <MaUTable {...getTableProps()}>
        <TableHead>
          {headerGroups.map((group, index) => (
            <TableHeaderGroup group={group} key={index} />
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {page.map((row: Row<any>, index) => (
            <CustomTableRow row={row} key={index} />
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
      </MaUTable>
    </Paper>
  );
}

export default DataTable;
