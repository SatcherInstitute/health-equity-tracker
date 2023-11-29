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

import styles from '../methodologyComponents/MethodologyPage.module.scss'

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

const StripedTable: React.FC<StripedTableProps> = ({
  rows,
  columns,
  id,
  applyThickBorder = true,
}) => {
  return (
    <TableContainer component={Paper} id={id}>
      <Table aria-label='customized table' className={styles.StripedTable}>
        <TableHead>
          <TableRow
            // className={styles.StripedTableHeader}
            className='bg-alt-green text-navlink-color'
          >
            {columns.map((col) => (
              <TableCell key={col.accessor}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className={styles.StripedTable}>
          {rows.map((row, rowIndex) => (
            <StyledTableRow
              key={rowIndex}
              className={
                applyThickBorder &&
                rows.length !== 3 &&
                (rowIndex + 1) % 2 === 0
                  ? 'border-0 border-b-2 border-alt-green'
                  : ''
              }
            >
              {columns.map((col) => (
                <TableCell
                  key={col.accessor}
                  component='td'
                  className='font-text text-left text-small font-normal'
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

export default StripedTable
