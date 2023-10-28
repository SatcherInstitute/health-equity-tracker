import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import styles from './MethodologyPage.module.scss'

// Define the CodeData type
interface CodeData {
  content: string | JSX.Element
}

interface CodeBlockProps {
  rowData: CodeData[]
  border?: boolean
  minWidth?: number | string // Can be a number (like 700) or a string (like "700px")
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  rowData,
  border = true,
  minWidth = 700, // Default value
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
