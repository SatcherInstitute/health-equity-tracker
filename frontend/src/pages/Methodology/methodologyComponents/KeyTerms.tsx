import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { parseDescription } from './GlossaryTerm'
import React, { useState } from 'react'
import { useIsBreakpointAndUp } from '../../../utils/hooks/useIsBreakpointAndUp'
import HetTerm from '../../../styles/HetComponents/HetTerm'

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
  const isMd = useIsBreakpointAndUp('md')

  const [expanded, setExpanded] = useState(isMd)

  const handleAccordionToggle = (
    event: React.SyntheticEvent,
    newExpanded: boolean
  ) => {
    setExpanded(newExpanded)
  }

  return (
    <div id={id} className='mt-8 w-full'>
      <Paper>
        <Accordion expanded={expanded} onChange={handleAccordionToggle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 className='m-0 p-0'>Key Terms</h3>
          </AccordionSummary>

          <AccordionDetails>
            {definitionsArray.map((item) => {
              return (
                <div className='mb-8' id={item.id} key={item.topic}>
                  <HetTerm>{item.topic}</HetTerm>
                  {item.definitions.map((def) => {
                    return (
                      <figure
                        key={def.key}
                        className='mx-1 mb-2 mt-1 flex flex-col  p-0'
                      >
                        <p className='mb-1 text-small font-medium'>{def.key}</p>
                        <p className='m-0 self-start pt-1 text-small text-altBlack'>
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
    </div>
  )
}

export default KeyTerms
