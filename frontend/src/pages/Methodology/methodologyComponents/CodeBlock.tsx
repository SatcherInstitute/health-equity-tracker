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
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ rowData }) => {
  return (
    <TableContainer className={styles.TableContainer}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
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
