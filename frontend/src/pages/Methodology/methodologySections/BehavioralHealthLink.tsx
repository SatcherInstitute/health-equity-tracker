// import { Alert } from '@mui/material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
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
import { behavioralHealthDefinitionsArray } from '../methodologyContent/BehavioralHealthDefinitions'
import KeyTerms from '../methodologyComponents/KeyTerms'
import DataTable from '../methodologyComponents/DataTable'
import { conditionVariableDefinitions } from '../methodologyContent/ConditionVariableDefinitions'

const BehavioralHealthLink: React.FC = () => {
  return (
    <section>
      <article>
        {/* <KeyTerms definitionsArray={behavioralHealthDefinitionsArray} /> */}
        {/* <DataTable
          headers={{
            topic: '',
            definition: 'Behavioral Health Terms',
          }}
          methodologyTableDefinitions={[behavioralHealthDefinitionsArray]}
        /> */}
        <DataTable
          headers={{
            topic: '',
            definition: 'Behavioral Health Key Terms',
          }}
          methodologyTableDefinitions={behavioralHealthDefinitionsArray}
        />

        {/* <Grid item xs={12}>
          <Paper>
            <Table className={styles.DataTable}>
              <TableHead>
                <TableRow>
                  <TableCell>Key Terms</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {behavioralHealthDefinitionsArray.map((item) => (
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
                                {definition.description}
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
        </Grid> */}
      </article>
    </section>
  )
}

export default BehavioralHealthLink
