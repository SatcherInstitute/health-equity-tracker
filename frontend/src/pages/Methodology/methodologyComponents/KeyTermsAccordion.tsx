import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
} from '@mui/material'
import type React from 'react'
import { useState } from 'react'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { useIsBreakpointAndUp } from '../../../utils/hooks/useIsBreakpointAndUp'
import type { GlossaryTermItem } from './GlossaryTerm'

interface KeyTermsAccordionProps {
  definitionsArray: Record<string, GlossaryTermItem>
  id?: string
}

export default function KeyTermsAccordion(props: KeyTermsAccordionProps) {
  const isMd = useIsBreakpointAndUp('md')

  const [expanded, setExpanded] = useState(isMd)

  const handleAccordionToggle = (
    event: React.SyntheticEvent,
    newExpanded: boolean,
  ) => {
    setExpanded(newExpanded)
  }

  const sortedDefinitions = Object.entries(props.definitionsArray).sort(
    ([keyA], [keyB]) => keyA.localeCompare(keyB),
  )

  return (
    <div id={props.id} className='mt-8 w-full'>
      <Paper>
        <Accordion expanded={expanded} onChange={handleAccordionToggle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 className='m-0 p-0'>Key Terms</h3>
          </AccordionSummary>

          <AccordionDetails>
            {sortedDefinitions.map(([topic, item]) => {
              return (
                <div className='mb-8' id={item.id} key={topic}>
                  <HetTerm>{topic}</HetTerm>
                  {item.definitions.map((def) => {
                    return (
                      <figure
                        key={def.key}
                        className='mx-1 mt-1 mb-2 flex flex-col p-0'
                      >
                        <p className='mb-1 font-medium text-small'>{def.key}</p>
                        <p className='m-0 self-start pt-1 text-altBlack text-small'>
                          {def.description}
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
