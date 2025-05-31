import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { het } from '../../../styles/DesignTokens'

interface StripedTableRowProps {
  children: React.ReactNode
  index: number
  applyThickBorder?: boolean
  rowCount?: number
}

function StripedTableRow({
  children,
  index,
  applyThickBorder,
  rowCount,
  ...props
}: StripedTableRowProps) {
  return (
    <TableRow
      sx={{
        backgroundColor: index % 2 === 0 ? het.standardInfo : het.white,
        '&:last-child td, &:last-child th': {
          border: 0,
        },
        ...(applyThickBorder && rowCount !== 3 && (index + 1) % 2 === 0
          ? {
              borderBottom: '2px solid',
              borderColor: 'methodologyGreen',
              borderLeft: 0,
              borderRight: 0,
              borderTop: 0,
            }
          : {}),
      }}
      {...props}
    >
      {children}
    </TableRow>
  )
}

interface StripedTableProps {
  rows: Record<string, any>[]
  columns: { header: string; accessor: string }[]
  id?: string
  applyThickBorder?: boolean
}

export default function StripedTable(props: StripedTableProps) {
  return (
    <TableContainer className='w-full' component={Paper} id={props.id}>
      <Table>
        <TableHead>
          <TableRow className='bg-methodology-green text-navlink-color'>
            {props.columns.map((col) => (
              <TableCell key={col.accessor}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((row, rowIndex) => (
            <StripedTableRow
              key={rowIndex}
              index={rowIndex}
              applyThickBorder={props.applyThickBorder}
              rowCount={props.rows.length}
            >
              {props.columns.map((col) => (
                <TableCell
                  key={col.accessor}
                  component='td'
                  className='text-left font-normal font-sans-text text-small'
                  scope='row'
                >
                  {row[col.accessor]}
                </TableCell>
              ))}
            </StripedTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
