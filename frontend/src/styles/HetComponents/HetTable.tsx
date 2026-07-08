import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Tooltip } from '@mui/material'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

export interface HetTableColumn {
  key: string
  header: React.ReactNode
}

interface HetTableProps {
  rows: Record<string, React.ReactNode | null>[]
  columns: HetTableColumn[]
  caption?: string
  variant?: 'methodology' | 'info'
  stickyHeader?: boolean
  size?: 'small' | 'medium'
  applyThickBorder?: boolean
  nullMessage?: string
  id?: string
  className?: string
}

const VARIANT_HEADER: Record<string, string> = {
  methodology: 'bg-methodology-green text-alt-black',
  info: 'bg-standard-info',
}

const VARIANT_ODD_ROW: Record<string, string> = {
  methodology: 'bg-methodology-green/10',
  info: 'bg-standard-info/50',
}

const VARIANT_EVEN_ROW: Record<string, string> = {
  methodology: 'bg-alt-white',
  info: '',
}

export default function HetTable({
  rows,
  columns,
  caption,
  variant = 'methodology',
  stickyHeader = false,
  size = 'medium',
  applyThickBorder = false,
  nullMessage = 'Insufficient data',
  id,
  className,
}: HetTableProps) {
  const headerClass = VARIANT_HEADER[variant]
  const useThickBorder = applyThickBorder && rows.length !== 3

  return (
    <TableContainer
      component={Paper}
      id={id}
      className={`w-full ${stickyHeader ? 'flex max-h-150 caption-top self-center overflow-auto' : ''} ${className ?? ''}`}
    >
      <Table stickyHeader={stickyHeader} size={size}>
        {caption && <caption className='font-medium'>{caption}</caption>}
        <TableHead>
          <TableRow className={headerClass}>
            {columns.map((col) => {
              const headerCellClass = `wrap-break-word ${variant === 'methodology' ? 'font-sans-text text-small font-medium' : ''}`
              return (
                <TableCell
                  key={col.key}
                  scope='col'
                  className={headerCellClass}
                >
                  {col.header}
                </TableCell>
              )
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => {
            const isOdd = rowIndex % 2 !== 0
            const rowClass = isOdd
              ? `${VARIANT_ODD_ROW[variant]}${useThickBorder ? ' border-b-2 border-methodology-green' : ''}`
              : VARIANT_EVEN_ROW[variant]

            return (
              <TableRow key={rowIndex} className={rowClass}>
                {columns.map((col, colIndex) => {
                  const value = row[col.key]
                  const cellClass = `wrap-break-word ${variant === 'methodology' ? 'font-sans-text text-small' : ''}`
                  const rowHeaderProps =
                    colIndex === 0
                      ? ({ component: 'th', scope: 'row' } as const)
                      : {}
                  return value == null ? (
                    <TableCell
                      key={col.key}
                      className={cellClass}
                      {...rowHeaderProps}
                    >
                      <Tooltip title={nullMessage}>
                        <WarningRoundedIcon />
                      </Tooltip>
                      <span className='sr-only'>{nullMessage}</span>
                    </TableCell>
                  ) : (
                    <TableCell
                      key={col.key}
                      className={cellClass}
                      {...rowHeaderProps}
                    >
                      {value}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
