import type React from 'react'
import { useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface AccordionData {
  question: string
  answer: React.ReactNode
}

interface HetAccordionProps {
  accordionData: AccordionData[] 
  divClassName?: string
  accordionClassName?: string
  summaryClassName?: string
detailsClassName?: string
}

const HetAccordion: React.FC<HetAccordionProps> = ({ accordionData, divClassName, accordionClassName, summaryClassName, detailsClassName }) => {
  const [expanded, setExpanded] = useState<string | false>(false)

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  return (
    <article className='grid mx-4'>
      <div className={`${divClassName ?? 'py-4'}`}>
        {accordionData.map((data, index) => (
          <Accordion
            key={data.question}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              border: 'none',
              boxShadow: 'none',
              '&::before': {
                content: 'none',
              },
            }}
            className={`list-none rounded-md border border-solid border-methodologyGreen ${accordionClassName ?? 'mb-8'}`}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index + 1}-content`}
              id={`panel${index + 1}-header`}
              className={`${
                expanded === `panel${index}` ? 'bg-hoverAltGreen rounded-t-md' : 'hover:bg-whiteSmoke80'
              }`}
            >
              <div className={`my-0 ${summaryClassName ?? 'py-4 text-title font-medium text-altBlack leading-lhSomeSpace'}`}>
                {data.question}
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className={`text-left text-text font-normal text-altBlack ${detailsClassName ?? 'my-0 px-6 py-4'}`}>
                {data.answer}
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </article>
  )
}

export default HetAccordion