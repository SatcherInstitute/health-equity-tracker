import type React from 'react'
import { useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HetTermUnderline from './HetTermUnderline'
import createHighlightedPreview from '../../utils/createHighlightedPreview'

interface AccordionData {
  question: string
  answer: React.ReactNode | string
}

interface HetAccordionProps {
  accordionData: AccordionData[]
  searchTerm: string
  divClassName?: string
  accordionClassName?: string
  summaryClassName?: string
  detailsClassName?: string
}

const HetAccordion: React.FC<HetAccordionProps> = ({
  accordionData,
  searchTerm,
  divClassName,
  accordionClassName,
  summaryClassName,
  detailsClassName,
}) => {
  const [expanded, setExpanded] = useState<string | false>(false)

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  return (
    <article className='grid mx-4'>
      <div className={`${divClassName ?? 'py-4'}`}>
        {accordionData.map((data, index) => {
          const isExpanded = expanded === `panel${index}`
          const answerText = typeof data.answer === 'string' ? data.answer : ''

          return (
            <div key={data.question} className='mb-8'>
              {/* Truncated preview paragraph with highlighted search term */}
              {!isExpanded && searchTerm && (
                <p className='text-text text-altBlack mb-2'>
                  {createHighlightedPreview(answerText, searchTerm, 200)}
                </p>
              )}

              <Accordion
                expanded={isExpanded}
                onChange={handleChange(`panel${index}`)}
                sx={{
                  border: 'none',
                  boxShadow: 'none',
                  '&::before': {
                    content: 'none',
                  },
                }}
                className={`list-none rounded-md border border-solid border-methodologyGreen ${accordionClassName ?? 'mb-4'}`}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index + 1}-content`}
                  id={`panel${index + 1}-header`}
                  className={`${
                    isExpanded
                      ? 'bg-hoverAltGreen rounded-t-md'
                      : 'hover:bg-whiteSmoke80'
                  }`}
                >
                  <div
                    className={`my-0 ${summaryClassName ?? 'py-4 text-title font-medium text-altBlack leading-lhSomeSpace'}`}
                  >
                    {data.question}
                  </div>
                </AccordionSummary>
                <AccordionDetails className={detailsClassName}>
                  <div
                    className={`text-left text-text font-normal text-altBlack ${detailsClassName ?? 'my-0 px-6 py-4'}`}
                  >
                    {data.answer}
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default HetAccordion
