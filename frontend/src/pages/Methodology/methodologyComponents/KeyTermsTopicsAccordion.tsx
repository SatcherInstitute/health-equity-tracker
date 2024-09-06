import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type React from 'react'
import { useState } from 'react'
import { useIsBreakpointAndUp } from '../../../utils/hooks/useIsBreakpointAndUp'
import type { DataTypeConfig } from '../../../data/config/MetricConfigTypes'
import InfoCitations from '../../../reports/ui/InfoCitations'
import HetTerm from '../../../styles/HetComponents/HetTerm'

interface KeyTermsTopicsAccordionProps {
  datatypeConfigs: DataTypeConfig[]
  hashId?: string
}

export default function KeyTermsTopicsAccordion(
  props: KeyTermsTopicsAccordionProps,
) {
  const isMd = useIsBreakpointAndUp('md')

  const [expanded, setExpanded] = useState(isMd)

  const handleAccordionToggle = (
    event: React.SyntheticEvent,
    newExpanded: boolean,
  ) => {
    setExpanded(newExpanded)
  }

  return (
    <div id={props.hashId} className='mt-8 w-full'>
      <Paper>
        <Accordion expanded={expanded} onChange={handleAccordionToggle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 className='m-0 p-0'>Key Terms</h3>
          </AccordionSummary>

          <AccordionDetails>
            {props.datatypeConfigs.map((config) => {
              return (
                <div className='m-2 mb-8' key={config.dataTypeId}>
                  <HetTerm>{config.fullDisplayName}</HetTerm>
                  <p className='mb-1 text-small font-medium'>
                    Measurement Definition
                  </p>
                  <p className='m-0 self-start pt-1 text-small text-altBlack'>
                    {config.definition?.text}
                  </p>
                  <InfoCitations citations={config.definition?.citations} />
                  {config?.description && (
                    <>
                      <p className='mb-1 text-small font-medium'>
                        Clinical Importance
                      </p>
                      <p className='m-0 self-start pt-1 text-small text-altBlack'>
                        {config.description.text}
                      </p>
                      <InfoCitations
                        citations={config.description?.citations}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </div>
  )
}
