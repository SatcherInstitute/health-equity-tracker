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
import {
  type ColumnDef,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import ChartTitle from '../cards/ChartTitle'
import type { DataTypeId, MetricConfig } from '../data/config/MetricConfigTypes'
import { formatFieldValue } from '../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
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
  const columnHelper = createColumnHelper<Record<string, any>>()

  // Define columns
  const columns = useMemo(() => {
    const cols: ColumnDef<any>[] = []

    // Add demographic column first
    cols.push(
      columnHelper.accessor(demographicType as string, {
        header: DEMOGRAPHIC_DISPLAY_TYPES[demographicType],
        cell: (info) => info.getValue(),
      }),
    )

    // Handle special case for hiv_stigma_index
    if (
      metricConfigs.length > 0 &&
      metricConfigs[0].metricId === 'hiv_stigma_index'
    ) {
      const firstMetricConfig = metricConfigs[0]
      cols.push(
        columnHelper.accessor(firstMetricConfig.metricId, {
          header:
            firstMetricConfig.columnTitleHeader ?? firstMetricConfig.shortLabel,
          cell: (info) =>
            formatFieldValue(firstMetricConfig.type, info.getValue(), true),
        }),
      )
    } else {
      // Add remaining metric columns
      metricConfigs.forEach((metricConfig) => {
        cols.push(
          columnHelper.accessor(metricConfig.metricId, {
            header: metricConfig.columnTitleHeader ?? metricConfig.shortLabel,
            cell: (info) =>
              formatFieldValue(metricConfig.type, info.getValue(), true),
          }),
        )
      })
    }

    return cols
  }, [metricConfigs, demographicType, columnHelper])

  // Set initial sorting state
  const initialSorting = useMemo<SortingState>(() => {
    if (demographicType !== 'income') {
      return [
        {
          id: demographicType,
          desc: false,
        },
      ]
    }
    return []
  }, [demographicType])

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: MAX_NUM_ROWS_WITHOUT_PAGINATION,
      },
      sorting: initialSorting,
    },
  })

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
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} style={headerCellStyle}>
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row, rowIndex) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const value = cell.getValue()
                      const numeratorCount = props.countColsMap.numeratorConfig
                        ?.metricId
                        ? row.original[
                            props.countColsMap.numeratorConfig.metricId
                          ]?.toLocaleString()
                        : ''
                      const denominatorCount = props.countColsMap
                        .denominatorConfig?.metricId
                        ? row.original[
                            props.countColsMap.denominatorConfig.metricId
                          ]?.toLocaleString()
                        : ''
                      let numeratorLabel =
                        props.countColsMap.numeratorConfig?.shortLabel ?? ''
                      if (numeratorCount === 1)
                        numeratorLabel = removeLastS(numeratorLabel)
                      const denominatorLabel =
                        props.countColsMap.denominatorConfig?.shortLabel ?? ''

                      return value == null ? (
                        <TableCell
                          key={cell.id}
                          style={rowIndex % 2 === 0 ? cellStyle : altCellStyle}
                        >
                          <Tooltip title={NO_DATA_MESSAGE}>
                            <WarningRoundedIcon />
                          </Tooltip>
                          <span className='sr-only'>{NO_DATA_MESSAGE}</span>
                        </TableCell>
                      ) : (
                        <TableCell
                          key={cell.id}
                          style={rowIndex % 2 === 0 ? cellStyle : altCellStyle}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                          <Units
                            column={cellIndex}
                            metric={props.metricConfigs}
                          />
                          {cellIndex === 1 &&
                          numeratorCount &&
                          denominatorCount ? (
                            <HetUnitLabel>
                              {' '}
                              ( {numeratorCount} {numeratorLabel} /{' '}
                              {denominatorCount} {denominatorLabel} )
                            </HetUnitLabel>
                          ) : (
                            <></>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
              {props.data.length > MAX_NUM_ROWS_WITHOUT_PAGINATION && (
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={data.length}
                      rowsPerPage={table.getState().pagination.pageSize}
                      page={table.getState().pagination.pageIndex}
                      onPageChange={(_, newPage) => {
                        table.setPageIndex(newPage)
                      }}
                      onRowsPerPageChange={(event) => {
                        table.setPageSize(Number(event.target.value))
                      }}
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
