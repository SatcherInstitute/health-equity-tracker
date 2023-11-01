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
import { parseDescription } from './GlossaryTerm'
import React, { useState } from 'react'

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
    <Grid item xs={12} id={id} className={styles.KeyTermsContainer}>
      <Paper>
        <Accordion expanded={expanded} onChange={handleAccordionToggle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 className={styles.AccordionHeader}>Key Terms</h3>
          </AccordionSummary>

          <AccordionDetails>
            {definitionsArray.map((item) => {
              return (
                <div id={item.id} key={item.topic}>
                  <h4>{item.topic}</h4>
                  {item.definitions.map((def) => {
                    return (
                      <figure key={def.key} className={styles.GridContainer}>
                        <span className={styles.ConditionKey}>
                          <strong>{def.key}</strong>
                        </span>
                        <p className={styles.ConditionDefinition}>
                          {parseDescription(def.description)}
                        </p>
                      </figure>
                    )
                  })}
                </div>
              )
            })}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Grid>
  )
}

export default KeyTerms
