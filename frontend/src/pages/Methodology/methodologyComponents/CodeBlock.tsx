import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import styles from './MethodologyPage.module.scss'

interface CodeData {
  content: string | JSX.Element
}

interface CodeBlockProps {
  rowData: CodeData[]
  border?: boolean
  minWidth?: number | string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  rowData,
  border = true,
  minWidth = 700,
}) => {
  const tableClass = border ? styles.BorderTable : styles.NoBorderTable

  return (
    <TableContainer>
      <Table className={tableClass} aria-label="customized table">
        <TableHead>
          <TableRow className={styles.TableCell}>
            {rowData.map((cell, index) => (
              <TableCell key={index}>
                <pre>{cell.content}</pre>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      </Table>
    </TableContainer>
  )
}
