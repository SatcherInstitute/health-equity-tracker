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

interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path?: string
}

const behavioralHealthDefinitionsArray = [
  {
    topic: 'Depression',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Depression is a mental illness that can cause a number of problems, including sadness, fatigue, and difficulty concentrating. It is more common in people of color and people with low incomes. Studying depression can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.',
      },
    ],
  },

  {
    topic: 'Excessive Drinking',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Excessive drinking is a major public health problem. It can lead to a number of health problems, including liver disease, heart disease, and cancer. It is more common in people of color and people with low incomes. Studying excessive drinking can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Adults who reported binge drinking— four or more [females] or five or more [males] drinks on one occasion in the past 30 days— or heavy drinking— eight or more [females] or 15 or more [males] drinks per week.',
      },
    ],
  },
]

const BehavioralHealthLink = () => {
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
        </Grid>
      </article>
    </section>
  )
}

export default BehavioralHealthLink
