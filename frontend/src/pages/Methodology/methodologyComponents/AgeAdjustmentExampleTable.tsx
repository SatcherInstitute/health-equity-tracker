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

type Row = Record<string, string | number>

interface Column {
  header: string
  accessor: string
}

interface AgeAdjustmentExampleTableProps {
  rows: Row[]
  columns: Column[]
}

const AgeAdjustmentExampleTable: React.FC<AgeAdjustmentExampleTableProps> = ({
  rows,
  columns,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table
        aria-label="customized table"
        className={styles.AgeAdjustmentExampleTable}
      >
        <TableHead>
          <TableRow className={styles.AgeAdjustmentExampleTableHeader}>
            {columns.map((col) => (
              <TableCell key={col.accessor}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className={styles.AgeAdjustmentExampleTable}>
          {rows.map((row, rowIndex) => (
            <StyledTableRow
              key={rowIndex}
              className={
                rows.length !== 3 && (rowIndex + 1) % 2 === 0
                  ? styles.thickBorder
                  : ''
              }
            >
              {columns.map((col) => (
                <TableCell key={col.accessor} component="td" scope="row">
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

export default AgeAdjustmentExampleTable
