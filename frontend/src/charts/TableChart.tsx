import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Tooltip } from '@mui/material'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { useMemo } from 'react'
import {
  type Column,
  type HeaderGroup,
  type Row as ReactTableRowType,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table'
import ChartTitle from '../cards/ChartTitle'
import type {
  DataTypeId,
  MetricConfig,
  MetricId,
} from '../data/config/MetricConfigTypes'
import { formatFieldValue } from '../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { LESS_THAN_POINT_1 } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import { het } from '../styles/DesignTokens'
import HetUnitLabel from '../styles/HetComponents/HetUnitLabel'
import Units from './Units'
import { type CountColsMap, NO_DATA_MESSAGE } from './mapGlobals'
import { removeLastS } from './utils'

const MAX_NUM_ROWS_WITHOUT_PAGINATION = 20

const headerCellStyle = {
  width: '200px',
  backgroundColor: het.exploreBgColor,
}

const cellStyle = {
  width: '200px',
}

const altCellStyle = {
  backgroundColor: het.standardInfo,
  width: '200px',
}

interface TableChartProps {
  countColsMap: CountColsMap
  data: Array<Readonly<Record<string, any>>>
  demographicType: DemographicType
  metricConfigs: MetricConfig[]
  dataTypeId: DataTypeId
  fips: Fips
  dataTableTitle: string
  subtitle?: string
}

export function TableChart(props: TableChartProps) {
  const { data, metricConfigs, demographicType } = props

  let columns:
    | Array<{ Header: string; Cell: (a: any) => string; accessor: MetricId }>
    | Array<Column<any>> = []

  if (
    metricConfigs.length > 0 &&
    metricConfigs[0].metricId === 'hiv_stigma_index'
  ) {
    const firstMetricConfig = metricConfigs[0]
    columns.push({
      Header:
        firstMetricConfig.columnTitleHeader ?? firstMetricConfig.shortLabel,
      Cell: (a: any) => formatFieldValue(firstMetricConfig.type, a.value, true),
      accessor: firstMetricConfig.metricId,
    })
  } else {
    columns = metricConfigs.map((metricConfig) => {
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
  const memoCols = useMemo<Column<any>[]>(() => columns, [metricConfigs])
  const memoData = useMemo(() => data, [data])

  const tableConfig: any = {
    columns: memoCols,
    data: memoData,
    initialState: {
      pageSize: MAX_NUM_ROWS_WITHOUT_PAGINATION,
    },
  }

  // Set initial sort order if data wasn't already custom sorted for income
  if (demographicType !== 'income') {
    tableConfig.initialState = {
      ...tableConfig.initialState,
      sortBy: [
        {
          id: demographicType,
          desc: false,
        },
      ],
    }
  }

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(tableConfig, useSortBy, usePagination)

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
  function TableDataRow({ row }: { row: ReactTableRowType<any> }) {
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
              <Units column={index} metric={props.metricConfigs} />
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
      {props.data.length <= 0 || props.metricConfigs.length <= 0 ? (
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
                  <TableHeaderRow
                    group={group}
                    key={group.id || `group-${index}`}
                  />
                ))}
              </TableHead>
              <TableBody {...getTableBodyProps()}>
                {page.map((row: ReactTableRowType<any>, index) => (
                  <TableDataRow row={row} key={row.id || `row-${index}`} />
                ))}
              </TableBody>
              {props.data.length > MAX_NUM_ROWS_WITHOUT_PAGINATION && (
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={memoData.length}
                      rowsPerPage={pageSize}
                      page={pageIndex}
                      onPageChange={(_, newPage) => gotoPage(newPage)}
                      onRowsPerPageChange={(event) =>
                        setPageSize(Number(event.target.value))
                      }
                      rowsPerPageOptions={[
                        MAX_NUM_ROWS_WITHOUT_PAGINATION,
                        MAX_NUM_ROWS_WITHOUT_PAGINATION * 2,
                        MAX_NUM_ROWS_WITHOUT_PAGINATION * 5,
                      ]}
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
