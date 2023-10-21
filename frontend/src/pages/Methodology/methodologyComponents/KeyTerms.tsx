// import { Alert } from '@mui/material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
} from '@mui/material'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import styles from '../methodologyComponents/MethodologyPage.module.scss'

import { parseDescription } from './DataTable'

interface KeyTermsProps {
  definitionsArray: Array<{
    topic: string
    definitions: Array<{
      key: string
      description: string
    }>
    path?: string
  }>
}

const KeyTerms: React.FC<KeyTermsProps> = ({ definitionsArray }) => {
  return (
    <section>
      <article>
        <Grid item xs={12}>
          <Paper>
            <Table className={styles.DataTable}>
              <TableHead>
                <TableRow>
                  <TableCell>Key Terms</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {definitionsArray.map((item) => (
                  <TableRow
                    className={styles.AccordionContainer}
                    key={item.topic}
                  >
                    <TableCell>
                      <Accordion className={styles.Accordion}>
                        <AccordionSummary
                          className={styles.AccordionSummary}
                          expandIcon={<ExpandMoreIcon />}
                        >
                          {item.topic}
                        </AccordionSummary>
                        <AccordionDetails className={styles.AccordionDetails}>
                          <Grid container spacing={2}>
                            {item.definitions.map((definition) => (
                              <Grid item xs={12} key={definition.key}>
                                <strong>{definition.key}:</strong>{' '}
                                {parseDescription(definition.description)}
                              </Grid>
                            ))}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </article>
    </section>
  )
}

export default KeyTerms
