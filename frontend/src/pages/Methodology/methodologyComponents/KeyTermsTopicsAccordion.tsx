import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
} from '@mui/material'
import type React from 'react'
import { useState } from 'react'
import type { DataTypeConfig } from '../../../data/config/MetricConfigTypes'
import InfoCitations from '../../../reports/ui/InfoCitations'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { useIsBreakpointAndUp } from '../../../utils/hooks/useIsBreakpointAndUp'

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
    _event: React.SyntheticEvent,
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
                  <p className='mb-1 font-medium text-small'>
                    Measurement Definition
                  </p>
                  <p className='m-0 self-start pt-1 text-altBlack text-small'>
                    {config.definition?.text}
                  </p>
                  <InfoCitations citations={config.definition?.citations} />
                  {config?.description && (
                    <>
                      <p className='mb-1 font-medium text-small'>
                        Clinical Importance
                      </p>
                      <p className='m-0 self-start pt-1 text-altBlack text-small'>
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
