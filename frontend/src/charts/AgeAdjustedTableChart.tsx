import { useMemo } from 'react'
import {
  type Column,
  type HeaderGroup,
  type Row,
  useSortBy,
  useTable,
} from 'react-table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableFooter from '@mui/material/TableFooter'
import Paper from '@mui/material/Paper'
import {
  type MetricConfig,
  type MetricId,
  formatFieldValue,
} from '../data/config/MetricConfig'
import { DEMOGRAPHIC_DISPLAY_TYPES } from '../data/query/Breakdowns'
import { Tooltip } from '@mui/material'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import { RACE } from '../data/utils/Constants'
import ChartTitle from '../cards/ChartTitle'
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

  let columns = metricConfigs.map((metricConfig) => {
    return {
      Header: metricConfig.shortLabel,
      Cell: (a: any) =>
        formatFieldValue(
          /* metricType: MetricType, */ metricConfig.type,
          /*   value: any, */ a.value,
          /*   omitPctSymbol: boolean = false */ true,
        ),
      accessor: metricConfig.metricId,
    }
  })
  columns = [
    {
      Header: DEMOGRAPHIC_DISPLAY_TYPES[RACE],
      Cell: (cell: any) => cell.value,
      accessor: RACE as MetricId,
    },
  ].concat(columns)

  // Changes deps array to columns on save, which triggers reload loop
  // eslint-disable-next-line
  const memoCols = useMemo<Column<any>[]>(() => columns, [metricConfigs])
  const memoData = useMemo(() => data, [data])

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
      useSortBy,
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
              <Tooltip title='No data available'>
                <WarningRoundedIcon />
              </Tooltip>
              <span className='sr-only'>No Data Available</span>
            </TableCell>
          ) : (
            <TableCell
              {...cell.getCellProps()}
              key={`data-${index}`}
              style={row.index % 2 === 0 ? cellStyle : altCellStyle}
            >
              {cell.render('Cell')}
            </TableCell>
          ),
        )}
      </TableRow>
    )
  }

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
            <Table {...getTableProps()}>
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
        </figure>
      )}
    </>
  )
}
