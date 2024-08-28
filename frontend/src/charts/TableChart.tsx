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
  type DataTypeId,
} from '../data/config/MetricConfig'
import {
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { Tooltip } from '@mui/material'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import type { Fips } from '../data/utils/Fips'
import ChartTitle from '../cards/ChartTitle'
import { removeLastS } from './utils'
import { type CountColsMap, NO_DATA_MESSAGE } from './mapGlobals'
import Units from './Units'
import HetUnitLabel from '../styles/HetComponents/HetUnitLabel'
import { het } from '../styles/DesignTokens'
import { LESS_THAN_POINT_1 } from '../data/utils/Constants'

export const MAX_NUM_ROWS_WITHOUT_PAGINATION = 20

export const headerCellStyle = {
  width: '200px',
  backgroundColor: het.exploreBgColor,
}

export const cellStyle = {
  width: '200px',
}

export const altCellStyle = {
  backgroundColor: het.standardInfo,
  width: '200px',
}

interface TableChartProps {
  countColsMap: CountColsMap
  data: Array<Readonly<Record<string, any>>>
  demographicType: DemographicType
  metrics: MetricConfig[]
  dataTypeId: DataTypeId
  fips: Fips
  dataTableTitle: string
  subtitle?: string
}

export function TableChart(props: TableChartProps) {
  const { data, metrics, demographicType } = props

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
      Header: DEMOGRAPHIC_DISPLAY_TYPES[demographicType],
      Cell: (cell: any) => cell.value,
      accessor: demographicType as MetricId,
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
            id: demographicType,
            desc: false,
          },
        ],
      },
    },
    useSortBy,
    usePagination,
  )

  /** Component for the table's header row **/
  function TableHeaderRow({ group }: { group: HeaderGroup<any> }) {
    const { key, ...restHeaderGroupProps } = group.getHeaderGroupProps()
    return (
      <TableRow key={key} {...restHeaderGroupProps}>
        {group.headers.map((col) => (
          <TableCell key={col.id} style={headerCellStyle}>
            {col.render('Header')}
          </TableCell>
        ))}
      </TableRow>
    )
  }

  /** Component for the table's data rows **/
  function TableDataRow({ row }: { row: Row<any> }) {
    const numeratorCount = props.countColsMap.numeratorConfig?.metricId
      ? row.original[
          props.countColsMap.numeratorConfig.metricId
        ]?.toLocaleString()
      : ''
    const denominatorCount = props.countColsMap.denominatorConfig?.metricId
      ? row.original[
          props.countColsMap.denominatorConfig.metricId
        ]?.toLocaleString()
      : ''
    let numeratorLabel = props.countColsMap.numeratorConfig?.shortLabel ?? ''
    if (numeratorCount === 1) numeratorLabel = removeLastS(numeratorLabel)
    const denominatorLabel =
      props.countColsMap.denominatorConfig?.shortLabel ?? ''
    prepareRow(row)
    if (row.cells.slice(1).every((cell) => cell.value == null)) {
      // skip a row if the only non-null item is the demographic group
      return <></>
    }

    const { key, ...restRowProps } = row.getRowProps()

    return (
      <TableRow key={key} {...restRowProps}>
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
              <span className='sr-only'>{NO_DATA_MESSAGE}</span>
            </TableCell>
          ) : (
            <TableCell
              {...cell.getCellProps()}
              key={`data-${index}`}
              style={row.index % 2 === 0 ? cellStyle : altCellStyle}
            >
              {cell.value < 0.1 && cell.value > 0 && index === 1
                ? LESS_THAN_POINT_1
                : cell.render('Cell')}
              <Units column={index} metric={props.metrics} />
              {index === 1 && numeratorCount && denominatorCount ? (
                <HetUnitLabel>
                  {' '}
                  ( {numeratorCount} {numeratorLabel} / {denominatorCount}{' '}
                  {denominatorLabel} )
                </HetUnitLabel>
              ) : (
                <></>
              )}
            </TableCell>
          ),
        )}
      </TableRow>
    )
  }

  return (
    <>
      {props.data.length <= 0 || props.metrics.length <= 0 ? (
        <h1>Insufficient Data</h1>
      ) : (
        <figure className='m-3'>
          <figcaption>
            <ChartTitle
              title={`${
                props.dataTableTitle
              } in ${props.fips.getSentenceDisplayName()} by ${DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]}`}
              subtitle={props.subtitle}
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
