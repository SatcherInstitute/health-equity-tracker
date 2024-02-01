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
import { het } from '../../../styles/DesignTokens'

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: het.standardInfo,
  },
  '&:nth-of-type(even)': {
    backgroundColor: het.white,
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
    <TableContainer className='w-full' component={Paper} id={props.id}>
      <Table>
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
