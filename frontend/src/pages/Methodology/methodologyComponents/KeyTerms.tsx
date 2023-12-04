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
                <div id={item.id} key={item.topic}>
                  <h4>{item.topic}</h4>
                  {item.definitions.map((def) => {
                    return (
                      <figure
                        key={def.key}
                        className='mx-1 mb-2 mt-1 flex flex-col  p-0'
                      >
                        <span className=''>
                          <strong>{def.key}</strong>
                        </span>
                        <p className='m-0 ml-1 self-start text-smallest text-alt-black'>
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
