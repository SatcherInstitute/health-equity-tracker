// import { Alert } from '@mui/material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
} from '@mui/material'
import { Paper } from '@material-ui/core'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { parseDescription } from './DataTable'
import React, { useState } from 'react'
import { id } from 'vega'

interface KeyTermsProps {
  definitionsArray: Array<{
    topic: string
    definitions: Array<{
      key: string
      description: string
    }>
    path?: string
    id?: string
  }>
  id?: string
}

const KeyTerms: React.FC<KeyTermsProps> = ({ definitionsArray, id }) => {
  // Destructure the 'id' prop here
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const [expanded, setExpanded] = useState(isDesktop)

  const handleAccordionToggle = (
    event: React.SyntheticEvent,
    newExpanded: boolean
  ) => {
    setExpanded(newExpanded)
  }

  return (
    <Grid item xs={12} className={styles.KeyTerms} id={id}>
      <Paper>
        <Accordion
          className={styles.AccordionHeader}
          expanded={expanded}
          onChange={handleAccordionToggle}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Key Terms
          </AccordionSummary>

          <AccordionDetails>
            {definitionsArray.map((item) => (
              <Accordion className={styles.Accordion} key={item.topic}>
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
            ))}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Grid>
  )
}

export default KeyTerms
