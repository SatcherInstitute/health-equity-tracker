import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Tooltip } from '@mui/material'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {
  type ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import ChartTitle from '../cards/ChartTitle'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import { formatFieldValue } from '../data/config/MetricConfigUtils'
import { DEMOGRAPHIC_DISPLAY_TYPES } from '../data/query/Breakdowns'
import { RACE } from '../data/utils/Constants'
import { het } from '../styles/DesignTokens'

const headerCellStyle = {
  width: '200px',
  backgroundColor: het.footerColor,
}

const cellStyle = {
  width: '200px',
}

const altCellStyle = {
  backgroundColor: het.greyGridColor,
  width: '200px',
}

interface AgeAdjustedTableChartProps {
  data: Array<Readonly<Record<string, any>>>
  metricConfigs: MetricConfig[]
  title: string
}

export function AgeAdjustedTableChart(props: AgeAdjustedTableChartProps) {
  const { data, metricConfigs } = props
  const columnHelper = createColumnHelper<Record<string, any>>()

  // Define columns
  const columns = useMemo(() => {
    const cols: ColumnDef<any>[] = []

    // Add race column first
    cols.push(
      columnHelper.accessor(RACE as string, {
        header: DEMOGRAPHIC_DISPLAY_TYPES[RACE],
        cell: (info) => info.getValue(),
      }),
    )

    // Add metric columns
    metricConfigs.forEach((metricConfig) => {
      cols.push(
        columnHelper.accessor(metricConfig.metricId, {
          header: metricConfig.shortLabel,
          cell: (info) =>
            formatFieldValue(metricConfig.type, info.getValue(), true),
        }),
      )
    })

    return cols
  }, [metricConfigs, columnHelper])

  // Set initial sorting state
  const initialSorting = useMemo<SortingState>(() => {
    return [
      {
        id: RACE,
        desc: false,
      },
    ]
  }, [])

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: initialSorting,
    },
  })

  return (
    <>
      {props.data.length <= 0 || props.metricConfigs.length <= 0 ? (
        <h1>No Data provided</h1>
      ) : (
        <figure className='m-3'>
          <figcaption>
            <ChartTitle title={props.title} />
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
                    {row.getVisibleCells().map((cell) => {
                      const value = cell.getValue()

                      return value == null ? (
                        <TableCell
                          key={cell.id}
                          style={rowIndex % 2 === 0 ? cellStyle : altCellStyle}
                        >
                          <Tooltip title='No data available'>
                            <WarningRoundedIcon />
                          </Tooltip>
                          <span className='sr-only'>No Data Available</span>
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
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow />
              </TableFooter>
            </Table>
          </TableContainer>
        </figure>
      )}
    </>
  )
}
