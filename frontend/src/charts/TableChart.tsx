import { useMemo } from 'react'
import {
  type Column,
  type HeaderGroup,
  type Row,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableFooter from '@mui/material/TableFooter'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import {
  type MetricConfig,
  type MetricId,
  formatFieldValue,
  SYMBOL_TYPE_LOOKUP,
  type DataTypeId,
} from '../data/config/MetricConfig'
import {
  BREAKDOWN_VAR_DISPLAY_NAMES,
  type BreakdownVar,
} from '../data/query/Breakdowns'
import { Tooltip, useMediaQuery } from '@mui/material'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import styles from './Chart.module.scss'
import sass from '../styles/variables.module.scss'
import { NO_DATA_MESSAGE } from './Legend'
import { type Fips } from '../data/utils/Fips'
import ChartTitle from '../cards/ChartTitle'

export const MAX_NUM_ROWS_WITHOUT_PAGINATION = 20

export const headerCellStyle = {
  width: '200px',
  backgroundColor: sass.exploreBgColor,
}

export const cellStyle = {
  width: '200px',
}

export const altCellStyle = {
  backgroundColor: sass.standardInfo,
  width: '200px',
}

export interface TableChartProps {
  data: Array<Readonly<Record<string, any>>>
  breakdownVar: BreakdownVar
  metrics: MetricConfig[]
  dataTypeId: DataTypeId
  fips: Fips
  dataTableTitle: string
}

export function TableChart(props: TableChartProps) {
  const wrap100kUnit = useMediaQuery('(max-width:500px)')
  const { data, metrics, breakdownVar } = props

  let columns:
    | Array<{ Header: string; Cell: (a: any) => string; accessor: MetricId }>
    | Array<Column<any>> = []

  if (metrics.length > 0 && metrics[0].metricId === 'hiv_stigma_index') {
    const firstMetricConfig = metrics[0]
    columns.push({
      Header:
        firstMetricConfig.columnTitleHeader ?? firstMetricConfig.shortLabel,
      Cell: (a: any) => formatFieldValue(firstMetricConfig.type, a.value, true),
      accessor: firstMetricConfig.metricId,
    })
  } else {
    columns = metrics.map((metricConfig) => {
      return {
        Header: metricConfig.columnTitleHeader ?? metricConfig.shortLabel,
        Cell: (a: any) => formatFieldValue(metricConfig.type, a.value, true),
        accessor: metricConfig.metricId,
      }
    })
  }

  columns = [
    {
      Header: BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar],
      Cell: (cell: any) => cell.value,
      accessor: breakdownVar as MetricId,
    },
    ...columns,
  ]

  // Changes deps array to columns on save, which triggers reload loop
  // eslint-disable-next-line
  const memoCols = useMemo<Column<any>[]>(() => columns, [metrics])
  const memoData = useMemo(() => data, [data])

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
  )

  /** Component for the table's header row **/
  function TableHeaderRow({ group }: { group: HeaderGroup<any> }) {
    return (
      <TableRow {...group.getHeaderGroupProps()}>
        {group.headers.map((col, index) => (
          <TableCell key={col.id} style={headerCellStyle}>
            {col.render('Header')}
          </TableCell>
        ))}
      </TableRow>
    )
  }

  /** Component for the table's data rows **/
  function TableDataRow({ row }: { row: Row<any> }) {
    prepareRow(row)
    return (
      <TableRow {...row.getRowProps()}>
        {row.cells.map((cell, index) =>
          cell.value == null ? (
            <TableCell
              {...cell.getCellProps()}
              key={`no-data-${index}`}
              style={row.index % 2 === 0 ? cellStyle : altCellStyle}
            >
              <Tooltip title={NO_DATA_MESSAGE}>
                <WarningRoundedIcon />
              </Tooltip>
              <span className={styles.ScreenreaderTitleHeader}>
                {NO_DATA_MESSAGE}
              </span>
            </TableCell>
          ) : (
            <TableCell
              {...cell.getCellProps()}
              key={`data-${index}`}
              style={row.index % 2 === 0 ? cellStyle : altCellStyle}
            >
              {cell.render('Cell')}
              <Units
                column={index}
                metric={props.metrics}
                wrap100kUnit={wrap100kUnit}
              />
            </TableCell>
          )
        )}
      </TableRow>
    )
  }

  return (
    <>
      {props.data.length <= 0 || props.metrics.length <= 0 ? (
        <h1>Insufficient Data</h1>
      ) : (
        <figure>
          <figcaption>
            <ChartTitle
              title={`${
                props.dataTableTitle
              } in ${props.fips.getSentenceDisplayName()}`}
            />
          </figcaption>

          <TableContainer component={Paper} style={{ maxHeight: '100%' }}>
            <Table {...getTableProps()}>
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
                        gotoPage(newPage)
                      }}
                      onRowsPerPageChange={(event) => {
                        setPageSize(Number(event.target.value))
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
        </figure>
      )}
    </>
  )
}

interface UnitsProps {
  column: number
  metric: MetricConfig[]
  wrap100kUnit: boolean
}
function Units(props: UnitsProps) {
  if (!props.column) return null

  const metric = props.metric[props.column - 1]

  const unit =
    metric.type === 'per100k'
      ? SYMBOL_TYPE_LOOKUP[metric.type]
      : metric.shortLabel

  // inline vs block
  return props.wrap100kUnit && metric.type === 'per100k' ? (
    <p className={styles.Unit}>{unit}</p>
  ) : (
    <span className={styles.Unit}>{unit}</span>
  )
}
