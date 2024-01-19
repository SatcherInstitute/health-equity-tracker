import * as React from 'react'
import { styled } from '@mui/material/styles'
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableBody,
} from '@mui/material'

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#fafafa',
  },
  '&:nth-of-type(even)': {
    backgroundColor: '#fff',
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

type Row = Record<string, any>

interface Column {
  header: string
  accessor: string
}

interface StripedTableProps {
  rows: Row[]
  columns: Column[]
  id?: string
  applyThickBorder?: boolean
}

export default function StripedTable(props: StripedTableProps) {
  return (
    <TableContainer
      className=' overflow-x-auto'
      component={Paper}
      id={props.id}
    >
      <Table aria-label='customized table' className='min-w-full'>
        <TableHead>
          <TableRow className='bg-methodologyGreen text-navlinkColor'>
            {props.columns.map((col) => (
              <TableCell key={col.accessor}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((row, rowIndex) => (
            <StyledTableRow
              key={rowIndex}
              className={
                props.applyThickBorder &&
                props.rows.length !== 3 &&
                (rowIndex + 1) % 2 === 0
                  ? 'border-0 border-b-2 border-methodologyGreen'
                  : ''
              }
            >
              {props.columns.map((col) => (
                <TableCell
                  key={col.accessor}
                  component='td'
                  className='text-left font-sansText text-small font-normal'
                  scope='row'
                >
                  {row[col.accessor]}
                </TableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
